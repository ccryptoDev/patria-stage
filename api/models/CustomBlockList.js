module.exports = {
  attributes: {
    employmentExclude: {
      type: "array"
    },
    routingNumberExclude: {
      type: "array"
    },
    zipCodeExclude: {
      type: "array"
    }
  },
  checkIfInBlockList:checkIfInBlockList
}
async function checkIfInBlockList(employmentName, routingNumber, zipCode) {
  const results = {employmentBlocked: false,routingNumberBlocked:false,zipCodeBlocked:false};
  if(!!employmentName || !!routingNumber || !!zipCode) {
      const customBlockList = await CustomBlockList.findOne({id: sails.config.leadApiConfig.leadConfig.blockListId});
      if(customBlockList) {
        if(!!employmentName && customBlockList.employmentExclude && customBlockList.employmentExclude.length > 0) {
                results.employmentBlocked = customBlockList.employmentExclude.indexOf(employmentName.trim()) >= 0
        }
        if(!!routingNumber && customBlockList.routingNumberExclude && customBlockList.routingNumberExclude.length > 0) {
          results.routingNumberBlocked = customBlockList.routingNumberExclude.indexOf(routingNumber.trim()) >= 0
        }
        if(!!zipCode && customBlockList.zipCodeExclude && customBlockList.zipCodeExclude.length > 0) {
          results.zipCodeBlocked = customBlockList.zipCodeExclude.indexOf(zipCode.trim()) >= 0
        }
      }
  }
  return results;
}
