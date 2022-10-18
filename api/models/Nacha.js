"use strict";

module.exports = {
	attributes: {
		filePath: { type: "string", required: true },
		fileHeaderRecord: { type: "json", required: true },
		batchHeaderRecord: { type: "json", defaultsTo: {} },
		entryDetailRecord: { type: "json", defaultsTo: [] },
		addendaRecord: { type: "json", defaultsTo: [] },
		batchControlRecord: { type: "json", defaultsTo: {} },
		fileControlRecord: { type: "json", defaultsTo: {} }
	}
};
