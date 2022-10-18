
module.exports = (req, res, next) => {
	if (req.isAuthenticated() && req.user && !!req.user.collectionRoleName && (req.user.rolename === "Admin" || req.user.collectionRoleName === CollectionRoles.collectionRolesEnum.COLLECTION_MANAGER) ) {
		return next();
	}else {
		if (req.xhr) {
			res.contentType( "application/json" );
			return res.status(403).json({message: "You are not authorized. You must be an Admin or have collection manager role set."})
		}else {
			return res.redirect( "admin/dashboard" );
		}
	}
};
