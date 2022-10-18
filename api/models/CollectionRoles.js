

const collectionRoleEnum ={
	COLLECTION_MANAGER: "COLLECTION_MANAGER",
	COLLECTION_STAFF: "COLLECTION_STAFF",
	UNASSIGNED: "UNASSIGNED"
};
const collectionRoleDisplay = {
	COLLECTION_MANAGER: "Collection Manager",
	COLLECTION_STAFF: "Collection Agent",
	UNASSIGNED: "Not in Collections"
};

module.exports = {
	attributes: {
		rolename: {
			type: "string",
			enum: Object.values(collectionRoleEnum),
			defaultsTo: collectionRoleEnum.UNASSIGNED
		},
		roleDisplay: {
			type: "string",
			enum: Object.values( collectionRoleDisplay ),
			defaultsTo:collectionRoleDisplay.UNASSIGNED
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		backendEnabled: {
			type: "integer",
			defaultsTo: 0
		}
	},

	collectionRolesEnum: collectionRoleEnum,
	collectionRolesDisplayEnum: collectionRoleDisplay,
	requiredRoleToSeeCollections: [collectionRoleEnum.COLLECTION_MANAGER, collectionRoleEnum.COLLECTION_STAFF],
	getCollectionRoles: getCollectionRoles
};

async function getCollectionRoles(criteria = {}) {
	const collectionRolesResponse = {};
	const collectionsRoles = await CollectionRoles.find(criteria);
	if(collectionsRoles && collectionsRoles.length > 0) {
		_.forEach(collectionsRoles, (collectionRole) => {
			if(collectionRole.rolename !== collectionRoleEnum.UNASSIGNED) {
				collectionRole["isCollectionRole"] = true;
			}
			collectionRolesResponse[collectionRole.rolename] = collectionRole;
		});
	}
	return collectionRolesResponse;
}
