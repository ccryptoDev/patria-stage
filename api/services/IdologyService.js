
"use strict"

const request = require( "request" );
const idologyConfig = sails.config.idologyConfig.getIdologyConfig();
const { response } = require("express");
const { resolve } = require("q");
const { reject } = require("lodash");
const axios = require('axios');
const xml2js = require('xml2js');
const FormData = require('form-data');

module.exports = {
    verifyEmail: verifyEmail,
    verifyPhoneNumber: verifyPhoneNumber,
}


async function verifyEmail(email, firstname, lastname, realUser = null) {
    try {
        // IDology API call
        const invoice = "{invoice}";
        var url = `${idologyConfig.emailVerificationURL}`;
        var headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const body = `username=${idologyConfig.username}&password=${idologyConfig.password}&firstName=${firstname}&lastName=${lastname}&invoice=1&email=${email}`
        // const formBody = new FormData();
        // formBody.append("username", idologyConfig.username);
        // formBody.append("password", idologyConfig.password);
        // formBody.append("firstName", firstname);
        // formBody.append("lastName", lastname);
        // formBody.append("invoice", invoice);
        // formBody.append("email", idologyConfig.email);
        
        var response = await axios.post(url, body, {headers: headers});
        

        //Parse response
        var xmlresponse = response.data;
        if (process.env.NODE_ENV === 'staging' && realUser && !!realUser.email) {
            email = realUser.email;
            firstname = realUser.firstname;
            lastname = realUser.lastname
        }
        // var options = {
        //     object: true,
        //     reversible: false,
        //     coerce: false,
        //     sanitize: true,
        //     trim: true,
        //     arrayNotation: false,
        //     alternateTextNode: false
        // };
        var result = await parseXmlToJson(xmlresponse);// parser.toJson(xmlresponse, options);
        var user = await User.findOne({ email: email });
        
        await IDologyResponse.saveIDologyResponse(user.id, result, {request: {url: url, body: body}}); // wrong but template louis
        if( result.response.error ) {
            return {message: result.response.error, passed: false};
        }
        if( result.response["email-verify-result"].message === 'PASS' ) {
            return {message: "pass", passed: true};
        } else {
            return {message: result.response.qualifiers && result.response.qualifiers.qualifier && !!result.response.qualifiers.qualifier.message?result.response.qualifiers.qualifier.message:"failed", passed: false};
        }
    } catch( err ) {
        sails.log.error("IdologyService#verifyEmail Error: " , err);
        return {message: `Server error: ${err.message}`, passed: false, isServerError:true};
    }
}

function verifyPhoneNumber( paramObj ) {
    const phoneNumber = paramObj.phoneNumber;
    const userid = paramObj.userId;
    const screenId = paramObj.screenId;

    return new Promise( (resolve, reject) => {
        const phoneVerifyObj = {
            url: `${idologyConfig.phoneVerificationURL}?username=${idologyConfig.username}&password=${idologyConfig.password}&telephone=${phoneNumber}`,
            method: "POST",
            headers: { "Content-Type": "text/xml" },
        };
        request( phoneVerifyObj, ( err, response, body) => {
            if(err) reject( err );
            resolve( body );
        })
    })
    .then( ( xmlBody) => {
        const parser = new xml2js.Parser( { explicitArray: false } );
        var result = null;
        parser.parseString( xmlBody, function( err, verifyResult) {
            if( err ) {
                sails.log.info( "IdologyService.verifyPhoneNumber; err:", err );
                throw {
                    message: err,
                    code: 500,                                                                  // Server failure.
                };
            }
            // bill.TODO: wait for the API to work.
            sails.log.info("!!!!!!!!!!!!!!!!!!!!!!!!!!!!  IDOLOGY:", xmlBody)
        });
        return Promise.resolve( 'Phone number veerification success.' );
    })
}
async function parseXmlToJson(xmlString) {
    return new Promise((resolve,reject) => {
        const parser = new xml2js.Parser( { explicitArray: false } );
        parser.parseString( xmlString, function( err, jsonResult) {
            if( err ) {
                sails.log.info( "IdologyService.parseXmlToJson; err:", err );
                return reject( {
                    message: err.message,
                    code: 500,                                                                  // Server failure.
                });
            }
            return resolve(jsonResult);
        });
    });
}
