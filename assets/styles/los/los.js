
/* global $, _ */
// window.datepicker = $.fn.datepicker.noConflict(); // return $.fn.datepicker to previously assigned value
// $.fn.bsdatepicker = $.fn.bootstrapDP = window.datepicker;

const ssnMask = {
	init: function() {
		this.bind();
	},
	bind: function() {
		$ssn.on( "keyup paste drop", this.syncInput );
	},
	transformDisplay: function( val ) {
		// Strip all non numbers
		let displayVal = val.replace( /[^0-9|\\*]/g, "" ).substr( 0, 9 );
		// Inject dashes
		if( displayVal.length >= 4 ) {
			displayVal = displayVal.slice( 0, 3 ) + "-" + displayVal.slice( 3 );
		}
		if( displayVal.length >= 7 ) {
			displayVal = displayVal.slice( 0, 6 ) + "-" + displayVal.slice( 6 );
		}
		// Replace all numbers with astericks
		if( ssnIsMasked ) {
			displayVal = displayVal.replace( /[0-9]/g, "*" );
		}
		return displayVal;
	},
	transformValue: function( val ) {
		if( typeof ssn_value !== "string" ) {
			ssn_value = "";
		}
		if( ! val ) {
			ssn_value = "";
			return;
		}
		const cleanVal = val.replace( /[^0-9|\\*]/g, "" ).substr( 0, 9 );
		for( let i = 0, l = cleanVal.length; i < l; ++i ) {
			if( /[0-9]/g.exec( cleanVal[ i ] ) ) {
				if( ssn_value.length === 0 || ssn_value.length === i ) {
					ssn_value += cleanVal[ i ];
				} else {
					ssn_value = ssn_value.substr( 0, i ) + cleanVal.charAt( i ) + ssn_value.substr( i + 1 );
				}
			}
		}
		ssn_value = ssn_value.substr( 0, cleanVal.length );
	},
	syncInput: function( e ) {
		let selectionStart = this.selectionStart;
		let selectionEnd = this.selectionEnd;
		const $input = $( this );
		const val = $( this ).val();
		const displayVal = ssnMask.transformDisplay( val );
		ssnMask.transformValue( val );
		$input.val( displayVal );
		$ssnVal.val( ssn_value );
		if( selectionStart == val.length && displayVal.length > val.length ) {
			selectionStart = selectionEnd = displayVal.length;
		}
		this.setSelectionRange( selectionStart, selectionEnd );
	}
};

document.addEventListener( "DOMContentLoaded", function() {
	// ready!
	$( "html,body" ).animate( { scrollTop: 0 }, "fast" );

	$ssn = $( "#ssn" );
	$ssn.isMasked = true;
	$ssnVal = $( "#ssn-val" );
	ssnMask.init();

	$( "#mailing_address" ).on( "change", mailingAddressChecked );
	 // initDOB();
} );

var ssn_value;
var $ssn;
var $ssnVal;

$( "#userinformation_form" ).validate( {
	ignore: [],
	rules: {
		firstname: { required: true },
		lastname: { required: true },
		email: { email: true },
		phone: { verifyPhoneNumber: true, required: true },
		street: { required: true },
		city: { required: true },
		state: { required: true },
		zipcode: { required: true },
		ssn: { required: true },
		dateofBirth: { required: true },
		requestedLoanAmount: { required: true },
		monthlyIncome: { required: true },
		creditpullconfirm: { required: true },
		collateral: { required: true },
		collateraldescription: { required: true }
	},
	messages: {
		firstname: { required: "Please enter your first name." },
		lastname: { required: "Please enter your last name." },
		email: { email: "Please enter a valid email address." },
		phone: { verifyPhoneNumber: "Please enter a valid phone number.", required: "Please enter your phone number." },
		street: { required: "Please enter your street name." },
		city: { required: "Please enter your city." },
		state: { required: "Please enter your state." },
		zipcode: { required: "Please enter your zip code." },
		ssn: { required: "Please enter your social security number." },
		dateofBirth: { required: "Please enter your date of birth." },
		requestedLoanAmount: { required: "Please enter a loan amount." },
		monthlyIncome: { required: "Please enter your monthly income." },
		creditpullconfirm: { required: "Consent to the agreements is required." },
		collateral: { required: "Please select an item for collateral" },
		collateraldescription: { required: "Please add a short description of your collateral" }
	}
} );

function submitStep1() {
	const isValid = $( "#step1_form" ).valid();
	console.log( "#step1_form.valid()", isValid );
	if( ! isValid ) return;
	const serializeForm = $( "#step1_form" ).serializeArray();
	const postData = {};
	_.forEach( serializeForm, function( formData ) {
		postData[ formData.name ] = formData.value;
	} );
	$.ajax( {
		method: "POST",
		url: $( "#step1_form" ).attr( "action" ),
		cache: false,
		dataType: "json",
		headers: { "Content-Type": "application/json" },
		processData: false,
		data: JSON.stringify( postData ),
		success: function( res ) {
			console.log( "POST step1", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		}
	} );
	return false;
}


function mailingAddressChecked( event ) {
	const $el = $( "#mailing_address" );
	if( $el.is( ":checked" ) ) {
		$( "#mailing_street_name" ).val( $( "#street_name" ).val() );
		$( "#mailing_unitapt" ).val( $( "#unitapt" ).val() );
		$( "#mailing_city" ).val( $( "#city" ).val() );
		$( "#mailing_state" ).val( $( "#state" ).val() );
		$( "#mailing_zip_code" ).val( $( "#zip_code" ).val() );
	}
}


function submitUserInformation() {
	const isValid = $( "#userinformation_form" ).valid();
	console.log( "#userinformation_form.valid()", isValid );
	if( ! isValid ) return;
	const serializeForm = $( "#userinformation_form" ).serializeArray();
	const postData = {};
	showLoadingSpinner();
	_.forEach( serializeForm, function( formData ) {
		postData[ formData.name ] = formData.value;
	} );
	$.ajax( {
		method: "POST",
		url: "userinformation",
		cache: false,
		dataType: "json",
		headers: { "Content-Type": "application/json" },
		processData: false,
		data: JSON.stringify( postData ),
		success: function( res ) {
			hideLoadingSpinner();
			console.log( "POST userinformation", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		}
	} );
	return false;
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

//offers


$(".offerBox-overlay").hover(function() {
	const $btn = $(this).siblings(".offerBox").find(".selectOfferBtn");
	$btn.toggleClass("hovered");
});
$(".offerBox").hover(function() {
	const $btn = $(this).find(".selectOfferBtn");
	$btn.toggleClass("hovered");
});
$(".offerBox-overlay").click(function() {
	const offerEl = $(this).siblings(".offerBox").find(".selectOfferBtn");
	// let isLOSPage = $(this).parents(".offersPage").hasClass("offersPage");
	offerSelection( offerEl );
});
$(".offerBox").click(function() {
	const offerEl = $(this).find(".selectOfferBtn");
	// let isLOSPage = $(this).parents(".offersPage").hasClass("offersPage");
	offerSelection( offerEl );
});


$("#viewFeesToggle").on("click", function() {
	$(".optServices").slideToggle("fast");
	$(".offerDetails").slideToggle("fast");
});


function offerSelection( thisElement ) {
	$(".selectOfferBtn").text("Select Offer");
	$(thisElement).text("Selected");
	$(".selectOfferBtn").css("background", "#0a053829");
	$(thisElement).css("background", "#0a05388a");

	const $el = $(".offerBox_container").has( thisElement );
	const $boxOverlay = $(".offerBox_container").has( thisElement ).children(".offerBox-overlay");
	const offerid = $el.attr( "data-offer-id" );
	$( "#offerid" ).val( offerid );

	$(".offerBox-overlay").removeClass("offerBox-selected").fadeIn();
	$boxOverlay.addClass("offerBox-selected").fadeOut();
	$( ".offerBox_container").find( ".selected-offer" ).removeClass("selected-offer-active");
	$( ".offerBox_container").find(".selected-offer-content").hide();
	$( ".offerBox_container").find(".nonselected-offer-content").fadeIn();
	$el.find( ".selected-offer" ).addClass("selected-offer-active");
	$el.find( ".nonselected-offer-content" ).hide();
	$el.find( ".selected-offer-content" ).fadeIn();
}

function submitOffers() {
	console.log('======url=========>',$( "#offers_form" ).attr( "action" ))
	showLoadingSpinner();
	const serializeForm = $( "#offers_form" ).serializeArray();
	const postData = {};
	_.forEach( serializeForm, function( formData ) {
		postData[ formData.name ] = formData.value;
	} );
	console.log('======data=========>',JSON.stringify( postData ))
	$.ajax( {
		method: "POST",
		url: $( "#offers_form" ).attr( "action" ),
		cache: false,
		dataType: "json",
		headers: { "Content-Type": "application/json" },
		processData: false,
		data: JSON.stringify( postData ),
		success: function( res ) {
			console.log( "POST offers====>", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		},
		error: function( res ) {
			console.log( res );
		}
	} );
	// debugger
	return false;
}


function submitContracts() {
	const serializeForm = $( "#contracts_form" ).serializeArray();
	const postData = {};
	_.forEach( serializeForm, function( formData ) {
		postData[ formData.name ] = formData.value;
	} );
	$.ajax( {
		method: "POST",
		url: $( "#contracts_form" ).attr( "action" ),
		cache: false,
		dataType: "json",
		headers: { "Content-Type": "application/json" },
		processData: false,
		data: JSON.stringify( postData ),
		success: function( res ) {
			console.log( "POST contracts", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		}
	} );
	return false;
}


function submitEmploymentDetails() {
	showLoadingSpinner();
	const otherIncome = [];
	let idx = 1;
	while( $( "#income_source" + idx.toString() ).length ) {
		otherIncome.push( {
			source: $( "#income_source" + idx.toString() ).val(),
			amount: parseFloat( $( "#income_amount" + idx.toString() ).val().replace(/[\D\,]/g, "") || 0 ),
			frequency: $( "#income_frequency" + idx.toString() ).val(),
		} );
		idx++;
	}

	const employmentDetails = {
		position: $("#position").val(),
		employer_name: $("#employer_name").val(),
		employer_years: $("#employer_years").val(),
		employer_months: $("#employer_months").val(),
		employer_income: parseFloat($("#employer_income").val().replace(/[\D\,]/g, "") || 0),
		pay_frequency: $("#pay_frequency").val(),
		employer_street: $("#employer_inputStreet").val(),
		employer_unit: $("#employer_inputUnit").val(),
		employer_city: $("#employer_inputCity").val(),
		employer_state: $("#employer_inputState").val(),
		employer_zip: $("#employer_inputZip").val(),
		employer_phone: $("#employer_phone").val(),
		is_self_employed: $( "#is_self_employed" ).is( ":checked" ),
		ssi_income: parseFloat($("#ssi_income").val().replace(/[\D\,]/g, "") || 0)
	};

	const data = {
		id: $( "#appUserId" ).val(),
		screenid: $( "#screenid" ).val(),
		otherIncome: otherIncome,
		employmentDetails: employmentDetails
	};

	$.ajax( {
		type: "POST",
		url: $( "#employer-info-form" ).attr( "action" ),
		dataType: "json",
		data: data,
		success: function( res ) {
			console.log( "POST employmentdetails", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		},
		error: function( xhr, resp, text ) {
			console.log( "error:", xhr, resp, text );
		}
	} );
}


function submitReferences() {
	const referenceData = {
		screenid: $( "#screenid" ).val(),
		name1: $("#references1_name").val(),
		phoneNumber1: $("#references1_phone").val(),
		relationship1: $("#references1_relation").val(),
		name2: $("#references2_name").val(),
		phoneNumber2: $("#references2_phone").val(),
		relationship2: $("#references2_relation").val()
	};

	$.ajax( {
		type: "POST",
		url: $( "#references-info-form" ).attr( "action" ),
		dataType: "json",
		data: referenceData,
		success: function( res ) {
			console.log( "POST references", res );
			if( res.code == 200 ) {
				window.location.href = res.redirect;
			}
		},
		error: function( xhr, resp, text ) {
			console.log( "error:", xhr, resp, text );
		}
	} );
	console.log( referenceData );
}


function submitDocumentCenter() {
	validateDocUpload();
	const uploadForm = $( "#documentcenter_form" );
	// ajaxFormDataPost( "/admin/uploadDocumentProof", uploadForm[ 0 ] )
	ajaxFormDataPost( $( "#documentcenter_form" ).attr( "action" ), uploadForm[ 0 ] )
	.then( function( res ) {
		console.log( "POST documentcenter", res );
		if( res.code == 200 ) {
			window.location.href = res.redirect;
		}
	}, function( error ) {
		console.log( "error:", error );
	} );
}


function maskSSN( el ) {
	$( el ).toggleClass( "fa-eye fa-eye-slash" );
	ssnIsMasked = ! ssnIsMasked;
	$ssn.val( ssnMask.transformDisplay( $ssnVal.val() ) );
}


function initDOB() {
	// const start = new Date();
	// start.setFullYear( start.getFullYear() - 100 );
	// const end = new Date();
	// end.setFullYear( end.getFullYear() - 18 );
	// $( "#dateofBirth" ).bootstrapDP( { weekStart: 2, startDate: start, endDate: end } )
	// .on( "changeDate", function( e ) {
	// 	$( "#dateofBirth" ).bootstrapDP( "hide" );
	// } );
}



function selectOffer( offerId, buttonElement ) {
	$( "#offerid" ).val( offerId );
	// submitOffers();

}

$( document ).ready( function() {
	$( "#btnFinalizeContract" ).on( "click", function( e ) {
		$( "#btnFinalizeContract" ).attr( "disabled", true );
		$( "#btnFinalizeContract" ).prop( "disabled", true );
		e.preventDefault();
		if( $( "#CRD_OK-Signature" ).html().length > 5 ) {
			submitContracts();
		}
	} );

} );


  //Old fancy spinner
// function showSpinner() {
// 	$( ".loading-spinner" ).addClass( "show-loading-spinner" );
// 	const snap = Snap.select( '.loader' );
// 	const arc1 = snap.select( '#arc1' );
// 	const arc2 = snap.select( '#arc2' );
// 	const len1 = arc1.getTotalLength();
// 	const len2 = arc2.getTotalLength();
// 	arc1.attr( { 'stroke-dasharray': len1, 'stroke-dashoffset': len1 } ).animate( { 'stroke-dashoffset': 0 }, 2500, mina.easeinout );
// 	arc2.attr( { 'stroke-dasharray': len2, 'stroke-dashoffset': len2 } ).animate( { 'stroke-dashoffset': 0 }, 2500, mina.easeinout );
// 	arc1.animate( { d: "M39.198,64c0-13.709,11.093-24.802,24.802-24.802 M88.803,64c0-13.709-11.094-24.802-24.803-24.802" }, 2500, mina.easeinout );
// 	arc2.animate( { d: "M88.803,64c0,13.708-11.094,24.802-24.803,24.802 M39.198,64c0,13.709,11.093,24.803,24.802,24.803" }, 2500, mina.easeinout );
// }

// function hideSpinner() {
// 	const snap = Snap.select( '.loader' );
// 	const circle = snap.select( '#circle' );
// 	circle.animate( { r: 44 }, 1000, mina.bounce );
// 	$( ".loading-spinner" ).addClass( "fadeOut" );
// 	$( ".wrapper" ).removeClass( "is-blurred" );
// 	setTimeout( function() { $( ".loading-spinner" ).removeClass( "show-loading-spinner" );	}, 2500 );
// }


function validateDocUpload() {
	const docutype = document.getElementById( "docutype" );
	if( docutype.value == "Others" ) {
		$( "#documentname" ).show();
		if( document.getElementById( "documentname" ).value == "" ) {
			$( '#documentname' ).addClass( 'error' );
			$( "#updocs" ).attr( "disabled", false );
			return false;
		} else {
			if( document.getElementById( "proofdocument" ).value == "" ) {
				$( '#documentname' ).removeClass( 'error' );
				$( "#updocs" ).attr( "disabled", false );
			} else {
				$( '#documentcenter_form' ).submit();
				$( '#documentname' ).removeClass( 'error' );
				$( "#updocs" ).attr( "disabled", true );
			}
		}
	} else {
		if( document.getElementById( "proofdocument" ).value == "" ) {
			$( "#updocs" ).attr( "disabled", false );
		} else {
			$( '#documentcenter_form' ).submit();
			$( "#docuNameCheck" ).hide();
			$( "#updocs" ).attr( "disabled", true );
		}
	}
}
