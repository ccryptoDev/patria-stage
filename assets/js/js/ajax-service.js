function ajaxPost(url, postData, contentType="json") {
  showLoadingSpinner();
  const deferred = $.Deferred();
  $.post({
    url: url,
    data: postData,
    dataType: contentType,
    success: function (data) {
      deferred.resolve(data);
    },
    error: function( xhr, status, text ) {
      deferred.reject(xhr);
    },
    complete: function( xhr, textStatus ) {
      hideLoadingSpinner();
    }
  });
  return deferred;
}

function ajaxPostNoSpinner( url, postData, contentType="json" ) {
	const deferred = $.Deferred();
	$.post( {
		url: url,
		data: postData,
		dataType: contentType,
		success: function( data ) {
			deferred.resolve( data );
		},
		error: function( xhr, status, text ) {
			deferred.reject( xhr );
		},
		complete: function( xhr, textStatus ) {
		}
	} );
	return deferred;
}

function ajaxFormDataPost(url, formElement, contentType="json", encType="multipart/form-data") {
  showLoadingSpinner();
  const deferred = $.Deferred();
  var formData = new FormData(formElement);
  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    dataType: contentType,
    cache: false,
    success: function (data,xhr, text) {
      deferred.resolve(data);
    },
    error: function( xhr, status, text ) {
      deferred.reject(xhr);
    },
    complete: function( xhr, textStatus ) {
      hideLoadingSpinner();
    }
  });
  return deferred;
}

function ajaxGet(url, queryParametersObjectOrString = "", contentType="json"){
  showLoadingSpinner();
  const deferred = $.Deferred();
  $.get({
    url: url,
    dataType: contentType,
    data: queryParametersObjectOrString,
    success: function (data) {
      deferred.resolve(data);
    },
    error: function( xhr, status, text ) {
      deferred.reject(xhr);
    },
    complete: function( xhr, textStatus ) {
      hideLoadingSpinner();
    }
  });
  return deferred;
}

function convertFormDataToJson(formSelector, additional_data={}) {
  const formToConvert = $(formSelector);
  const parsedData = {};
  _.forEach(formToConvert.serializeArray(), function(serializeObj) {
    let valueToConvert = serializeObj.value;
    if(!!valueToConvert) {
      if(valueToConvert.indexOf("$") >= 0) {
        valueToConvert = valueToConvert.replace( /[\$\s,]/g, "" );
      }else if(valueToConvert.trim().toLowerCase() === "true" || valueToConvert.trim().toLowerCase() === "false") {
          valueToConvert = valueToConvert.trim().toLowerCase() === "true";
      }
    }
    parsedData[serializeObj.name] =valueToConvert
  });
  return _.assign({},parsedData,additional_data);
}
function showLoadingSpinner() {
  spinnerIndex
  var spinnerElement = $("div.spinner-container");
  var showSpinnerClass = "show-loading-spinner";

  if(!spinnerIndex || spinnerIndex < 0){
    spinnerIndex = 1;
  }else {
    spinnerIndex++;
  }
  if(!spinnerElement.hasClass(showSpinnerClass)){
    spinnerElement.addClass(showSpinnerClass);
  }
}

function hideLoadingSpinner() {
  var spinnerElement = $("div.spinner-container");
  var showSpinnerClass = "show-loading-spinner";

  if(!spinnerIndex || spinnerIndex < 0){
    spinnerIndex = 0;
  }else {
    spinnerIndex--;
  }
  if(spinnerIndex === 0) {
    spinnerElement.removeClass(showSpinnerClass);
  }
}
