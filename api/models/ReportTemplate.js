"use strict";

module.exports = {
	attributes: {
		key: { type: "string", required: true },
		name: { type: "string", required: true },
		fields: { type: "array", required: true },
		access: { type: "array", required: false }
	}
};
