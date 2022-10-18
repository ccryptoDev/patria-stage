/* global PaymentManagement */
const Sails = require( "sails" ).constructor;
const sails = new Sails();
const moment = require("moment");
sails.load( { log: {
        level: 'error'
    }}, async ( err ) => {
  ( 1.005 ).toFixed( 2 ) == "1.01" || ( function( prototype ) {
    prototype.__toFixed = prototype.toFixed;
    prototype.toFixed = function( precision ) {
      return ( this + 0.0000001 ).__toFixed( precision );
    };
  } )( Number.prototype );
  
  global.$ize = function( num ) {
    return parseFloat( Number( num ).toFixed( 2 ) );
  };
    if( err ) {
        console.error( "Failed to start sails", err );
        return;
    }
    try {
      const reverseNachaCode = {
        "Account Closed": "R02",
        "Authorization Revoked by Customer": "R02",
        "Payment Stopped": "R08",
        "Account Frozen / Entry Returned Per OFAC Instruction": "R16"
      }
      const nachaConfig = sails.config.nacha;
        console.log( "Querying loans without for declines property..." );
        const paymentManagements = await PaymentManagement.find( {$or: [{status: PaymentManagement.paymentManagementStatus.active}, {status: PaymentManagement.paymentManagementStatus.chargeOff}]});
        console.log( `Loans found: ${paymentManagements.length}` );
        let hasDeclineDisable = false;
        if( paymentManagements.length > 0 ) {
            let updatedDocuments = 0;
            sails.log.error( "Updating loan...payment count " + paymentManagements.length );
            let index = 0;
            for( const paymentManagement of paymentManagements ) {
                let payments = await Payment.find({paymentmanagement: paymentManagement.id, status: Payment.STATUS_DECLINED});
                if(payments && payments.length > 0) {
                    for(const payment of payments) {
                        const reason = payment.returnReason;
                        if(!!reason){
                          const reverseCodeLookup = reverseNachaCode[reason];
                          if(!!reverseCodeLookup){
                            const code = nachaConfig.returnCodesToStopACH.find((code) => { return code === reverseCodeLookup});
                            if(!!code) {
                              hasDeclineDisable = true;
                              sails.log.error(`Found payment decline that needs to disable ach: ${payment.paymentmanagement} | ${code}`);
                              await Payment.update({id: payment.id}, {returnReasonCode: code});
                              await PaymentManagement.update({id: paymentManagement.id}, {disableAutoAch: true,isInCollections: false, isInPendingCollections: false});
                              
                            }
                          }
                        }
                    }
                }
                index = index + 1;
            
            }
            if(hasDeclineDisable) {
              await CollectionsCronService.checkCollectionsCron();
            }
        } else {
            console.log( "Nothing to be updated." );
        }
        sails.lower();
        process.exit( 0 );
    } catch ( error ) {
        console.log( "Could not run script, error: ", error );
        sails.lower();
        process.exit( 0 );
    }
} );
