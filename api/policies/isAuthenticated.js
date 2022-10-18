/**
 * Created by vishal on 5/10/16.
 */

var moment = require('moment');

var in_array = require('in_array');

module.exports = function (req, res, next) {
	if (req.isAuthenticated()) {
		req.user.createdAt = moment(req.user.createdAt).format('MMM, YYYY');
		var userrole = req.user.role;
		const collectionRole = req.user.collectionRole;
		var urlpath = req.path;
		var staffAdminpageArray = ['managestaffAdmin', 'addStaffAdmin', 'editstaffAdminuser', 'practiceCreditReportList'];
		var blockstaffAdminpageArray = ['practiceCreditReportList'];

		if (userrole) {
			var roleCriteria = {
				id: userrole
			};

			Roles.findOne(roleCriteria)
				.then(function (roledata) {
					console.log("roledata.rolename", roledata.rolename);

					let collectionRolePromise = null;
					//
					if (!!collectionRole) {
						collectionRolePromise = CollectionRoles.findOne({ id: collectionRole });
					} else if (roledata.rolename === "Admin") {
						collectionRolePromise = CollectionRoles.findOne({ rolename: "COLLECTION_MANAGER" });
					} else {
						collectionRolePromise = Promise.resolve();
					}
					collectionRolePromise.then((foundCollectionRole) => {
						req.user.rolename = roledata.rolename;
						if (foundCollectionRole) {
							req.user.collectionRole = foundCollectionRole.id;
							req.user.collectionRoleName = foundCollectionRole.rolename;
						}
						if (in_array(roledata.rolename, sails.config.allowedAdminRoles)) {
							if (in_array(roledata.rolename, sails.config.allowedPracticeRoles)) {
								req.user.rolename = roledata.rolename;
								if (foundCollectionRole) {
									req.user.collectionRoleName = foundCollectionRole.rolename;
								}
								req.session.adminroleName = roledata.rolename;

								//sails.log.info("session values:=================",req.session);

								var urlpathArray = urlpath.split('/');

								var pagename;
								if (urlpathArray.length > 1) {
									pagename = urlpathArray[2];
								}
								else if (urlpathArray.length > 0) {
									pagename = urlpathArray[1];
								}
								else {
									pagename = urlpath;
								}

								if (roledata.rolename === 'Rep' && in_array(pagename, blockstaffAdminpageArray)) {
									return res.redirect('/admin/dashboard');
								}
								else {
									if (roledata.rolename !== 'Rep' && in_array(pagename, staffAdminpageArray)) {
										return res.redirect('/admin/dashboard');
									}
									else {
										return next();
									}
								}
							}
							else {
								req.user.rolename = roledata.rolename;
								req.session.adminroleName = roledata.rolename;

								//sails.log.info("session values:=================",req.session);

								return next();
							}
						}
						else {
							req.session.errormsg = 'Invalid Username and Password';
							return res.redirect('/adminLogin');
						}
					})
				})
				.catch(function (err) {
					req.session.errormsg = 'Invalid Username and Password';
					return res.redirect('/adminLogin');
				});
		}
		else {
			return res.redirect('/adminLogin');
		}
	}
	else {
		return res.redirect('/adminLogin');
	}
};
