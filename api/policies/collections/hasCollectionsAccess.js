
module.exports = (req, res, next) => {
	if (req.isAuthenticated() && req.user && !!req.user.collectionRoleName &&  (req.user.rolename === "Admin" || CollectionRoles.requiredRoleToSeeCollections.indexOf(req.user.collectionRoleName) >= 0)) {
		return next();
	}else {
		if (req.xhr) {
			res.contentType( "application/json" );
			return res.status(403).json({message: "You are not authorized. You must be an Admin or have collection role set."})
		}else {
			return res.redirect( "admin/dashboard" );
		}
	}
};
