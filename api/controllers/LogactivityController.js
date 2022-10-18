/**
 * LogactivityController
 *
 * @description :: Server-side logic for managing logactivities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request'),
  moment = require('moment'),
  Q = require('q');

module.exports = {
	manageLogActivity: manageLogActivityAction,
	ajaxManageLogList: ajaxManageLogListAction,
	viewlogDetails: viewlogDetailsAction,
	communicationlog:communicationlogAction,
	ajaxcommunicationlog:ajaxcommunicationlogAction
};

function manageLogActivityAction(req, res) {
 res.view("admin/logs/managelogactivity");
}

function ajaxManageLogListAction(req, res) {
	
	//Sorting
	var colS = "";
	
	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'logreference': sorttype }; break;
		case '2':  var sorttypevalue = { 'email': sorttype }; break;
		case '3':  var sorttypevalue = { 'modulename': sorttype }; break;
		case '4':  var sorttypevalue = { 'logmessage': sorttype }; break;
		case '5':  var sorttypevalue = { 'remoteaddr': sorttype }; break;
		case '6':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};	
	

	//Search
	if(req.query.sSearch)
	{  
		var criteria = {
		  isDeleted: false,
		  or: [{logreference:  { 'contains': req.query.sSearch }}, {email:  { 'contains': req.query.sSearch }}, {modulename:  { 'contains': req.query.sSearch }},{logmessage:  { 'contains': req.query.sSearch }},{remoteaddr:  { 'contains': req.query.sSearch }},{createdAt:  { 'contains': req.query.sSearch }} ]
		};	
		  
	}
	else
	{
		var criteria = {
			isDeleted: false
    	};	
	}
	
	
	Logactivity
    .find(criteria)
	.sort( sorttypevalue)
	.then(function(logDetails) {
				   
		//Filter user details not available
		logDetails=_.filter(logDetails,function(item){
			if(item.email!='' && item.email!=null)
			{
				return true;
			}
		});
		
		totalrecords= logDetails.length;
		
		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}
		
		logDetails= logDetails.slice(skiprecord, iDisplayLengthvalue);
		
		
		
		
		
			
		var logData = [];	
		 
		logDetails.forEach(function(loginfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			loginfo.createdAt = moment(loginfo.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');
			
			
			if(loginfo.remoteaddr!='' && loginfo.remoteaddr!=null )
			{
				var remoteaddr = loginfo.remoteaddr;
			}else{
				var remoteaddr='--';
			}
			
		
			var actiondata ='<a href="/admin/viewlogDetails/'+loginfo.id+'"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';	
			
			logData.push({ loopid:loopid,logreference:loginfo.logreference, email: loginfo.email, modulename: loginfo.modulename,logmessage: loginfo.logmessage,remoteaddr: remoteaddr,createdAt:loginfo.createdAt,actiondata:actiondata });
			
			
		});
		 
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: logData
			};
		res.contentType('application/json');
		res.json(json);
	});
}

function viewlogDetailsAction(req, res){
	
	var logId = req.param('id');
	
	var criteria = {
					  id: logId
					};
					
	Logactivity
    .findOne(criteria)
	.populate('adminuser')
	.then(function (logdata) {
		if(logdata.logdata)
		{
			logDetails =JSON.stringify(logdata.logdata, null, 4);
		}
		var rs = {
				  logdata: logdata,
				  logDetails:logDetails
			     };			
		sails.log.info("logdata",rs)
		res.view("admin/logs/viewloginfo", rs);			
	})
	.catch(function (err) {
	  sails.log.error('LogactivityController#viewlogDetailsAction :: err :', err);
      return res.handleError(err);
	});
}

function communicationlogAction(req, res) {
	res.view("admin/logs/communicationlog");
}

function ajaxcommunicationlogAction(req, res)
{
	sails.log.info("ajaxcommunicationlogAction");
	//Sorting
	var colS = "";
	
	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'subject': sorttype }; break;
		case '2':  var sorttypevalue = { 'description': sorttype }; break;
		case '3':  var sorttypevalue = { 'logdata': sorttype }; break;
		case '4':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};	
	

	//Search
	if(req.query.sSearch)
	{  
		var criteria = {
		  isDeleted: false,
		  or: [{subject:  { 'contains': req.query.sSearch }}, {description:  { 'contains': req.query.sSearch }}, {logdata:  { 'contains': req.query.sSearch }},{createdAt:  { 'contains': req.query.sSearch }}]
		};	
		  
	}
	else
	{
		var criteria = {
			isDeleted: false
    	};	
	}
	
	
	Useractivity
    .find(criteria)
	.sort( sorttypevalue)
	.then(function(logDetails) {
				   
		//Filter user details not available
		
		sails.log.info("logDetails",logDetails);
		
		
		totalrecords= logDetails.length;
		
		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}
		
		logDetails= logDetails.slice(skiprecord, iDisplayLengthvalue);
		
					
		var logData = [];	
		 
		logDetails.forEach(function(loginfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			loginfo.createdAt = moment(loginfo.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');	
			
			logData.push({ loopid:loopid,subject:loginfo.subject,description: loginfo.description, logdata: loginfo.logdata,createdAt:loginfo.createdAt});
			
			
		});
		 
		 sails.log.info("logData",logData);
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: logData
			};
		sails.log.info("json data", json);	
		res.contentType('application/json');
		res.json(json);
	});

}