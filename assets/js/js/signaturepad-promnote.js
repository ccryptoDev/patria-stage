document.addEventListener( "DOMContentLoaded", function( ) {
	var $ = window.$ = jQuery.noConflict();

	initSigPads();

	$( "#esignature" ).on( "submit", function( event ) {
		if( $( "#issignedPromNote" ).val() != "1" || ( document.getElementById( "eft_consent" ) && document.getElementById( "eft_consent" ).checked == false ) || $( "#issignedHighCost" ).val() != "1" ) {
			if( $( "#issignedHighCost" ).val() == "0" ) {
				$( "#signerrorHighCost" ).show();
				$("#sigpad1")[ 0 ].scrollIntoView();
			}
			if( $( "#issignedPromNote" ).val() == "0" ) {
				$( "#signerror" ).show();
			}
			if( $( "#eft_consent" )[ 0 ].checked == false ) {
				$( "#nosignErrorHighCostText" ).html( "" );
				$( "#nosignErrorHighCostText" ).html( "Please accept the EFTA by clicking the checkbox." );
				$( "#nosignErrorHighCost" ).show();
			}
			event.preventDefault ? event.preventDefault() : event.returnValue = false;
			return false;
		}
		$( "#loaderidpromissorynote" ).show();
		return true;
	} );

    $( 'input:checkbox' ).change( function() {
      if( $( this.checked ) ) {
		$( "#nosignErrorHighCost" ).hide();
      }
	});

	$( "body" ).on( "hidden.bs.modal", function() {
		if( $( ".modal.show" ).length > 0 ) {
			$( "body" ).addClass( "modal-open" );
		}
	} );
  });
  function docstatuspromnote () {
	  $('#eftdocument').modal('hide');
		$('#eft_consent').prop('checked', true);
		$( "#eftaCheckbox" ).val( "checked" );
		$( "#eftaCheckboxsp" ).val( "checked" );
		$( "#eftaCheckboxsphc" ).val( "checked" );
		$( "#nosignErrorHighCost" ).hide();

	}
	function eftaChanged() {
		var checked = $( "#eftaCheckbox" ).val();
		if( checked === "" ) { //toggle
			$( "#eftaCheckbox" ).val( "checked" );
			$( "#eftaCheckboxsp" ).val( "checked" );
			$( "#eftaCheckboxsphc" ).val( "checked" );
		}
		else {
			$( "#eftaCheckbox" ).val( "" );
			$( "#eftaCheckboxsp" ).val( "" );
			$( "#eftaCheckboxsphc" ).val( "" );
		}
	}
	function businessChanged() {
		var checked = $( "#businessPurposesCheckbox" ).val();
		if( checked === "" ) {  //toggle
			$( "#businessPurposesCheckbox" ).val( "checked" );
			$( "#businessPurposesCheckboxsp" ).val( "checked" );
			$( "#businessPurposesCheckboxsphc" ).val( "checked" );
		}
		else {
			$( "#businessPurposesCheckbox" ).val( "" );
			$( "#businessPurposesCheckboxsp" ).val( "" );
			$( "#businessPurposesCheckboxsphc" ).val( "" );
		}
	}
	function brokerChanged() {
		var checked = $( "#brokerParticipatedCheckbox" ).val();
		if( checked === "" ) { //toggle
			$( "#brokerParticipatedCheckbox" ).val( "checked" );
			$( "#brokerParticipatedCheckboxsp" ).val( "checked" );
			$( "#brokerParticipatedCheckboxsphc" ).val( "checked" );
		}
		else {
			$( "#brokerParticipatedCheckbox" ).val( "" );
			$( "#brokerParticipatedCheckboxsp" ).val( "" );
			$( "#brokerParticipatedCheckboxsphc" ).val( "" );
		}
	}

function validatePrereqs() {
	var satisfied = true;

	if( $( "#issignedPromNote" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking arbitration signature" );
	}

	if( $( "#issignedHighCost" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking RIC signature" );
	}

	if( $( "#eft_consent_hidden" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking eft consent" );
	}

	return satisfied;
}

function enableFinalizeButton() {
	$( "#save" ).removeClass( "disabledFinalizeBtn" );
	$( "#save" ).addClass( "finalizeBtn" );
}

function disableFinalizeButton() {
	$( "#save" ).removeClass( "finalizeBtn" );
	$( "#save" ).addClass( "disabledFinalizeBtn" );
}

function initSigPads() {
	var wrapper = document.getElementById( "signature-pad" ) || document.getElementById( "signature-pad-HighCost" );
	if( wrapper == null ) {
		return null;
	}

	var acceptSignature = document.getElementById( "acceptSignature" );
	var clearSignature = document.getElementById( "clearSignature" );
	var canvas = wrapper.querySelector( "canvas" );
	var signaturePad = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});

	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeCanvas1() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad" );
		canvas.width = canvas.offsetWidth * ratio;
		canvas.height = canvas.offsetHeight * ratio;
		canvas.getContext("2d").scale(ratio, ratio);

		signaturePad.clear();
	}

	// On mobile devices it might make more sense to listen to orientation change,
	// rather than window resize events.
	// window.onresize = resizeCanvas1;
	resizeCanvas1();

	$( "#acceptSignature" ).off().on( "click", function( event ) {
		var data = signaturePad.toDataURL( "image/png" );
		var checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
		var hiddensignatureid = $( "#hiddensignatureid" ).val();

		if( signaturePad.isEmpty() && checkCanvasEmpty != 1 ) {
			$( "#nosignError" ).show();
			//$('#drawmodal').modal('show');
			return false;
		}
		let eftaCheckboxsp = "";
		let businessPurposesCheckboxsp = "";
		let brokerParticipatedCheckboxsp ="";
		if( $( "#eftaCheckboxsp" ).val() == "checked" || $( "#eftaCheckboxspServer" ).val() == "checked" ) {
			eftaCheckboxsp = "checked";
		}
		if( $( "#businessPurposesCheckboxsp" ).val() == "checked" || $( "#businessCheckboxspServer" ).val() == "checked" ) {
			businessPurposesCheckboxsp = "checked";
		}
		if( $( "#brokerParticipatedCheckboxsp" ).val() == "checked" || $( "#brokerCheckboxspServer" ).val() == "checked" ) {
			brokerParticipatedCheckboxsp = "checked";
		}
		// var eftaCheckboxsp = $( "#eftaCheckboxsp" ).val();
		// var businessPurposesCheckboxsp = $( "#businessPurposesCheckboxsp" ).val();
		// var brokerParticipatedCheckboxsp = $( "#brokerParticipatedCheckboxsp" ).val();
		$( "#acceptSignature" ).attr("disabled", true);
		$( "#clearSignature" ).attr("disabled", true);
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid="+hiddensignatureid,
			data: { imgBase64: data, esignatureType: 2, eftaCheckbox: eftaCheckboxsp, brokerParticipatedCheckbox: brokerParticipatedCheckboxsp, businessPurposesCheckbox: businessPurposesCheckboxsp },
			dataType:'json',
			beforeSend: function() {
				$("#save_signature_loading").css("display","block");
				//$("#save_signature_loading").css("display","inline-block");
				//$('#save_signature_loading').html('<div class="text-center"><img src="/images/imgv3/ajax-loader.gif" class="img-responsive center-block" alt="Loader Image"></div>');
			}
			,complete:function() { }
			,success:function(res) {
				$("#save_signature_loading").css("display","none");
				//$('#save_signature_loading').html('');
				$("#acceptSignature").attr("disabled", false);
				$("#clearSignature").attr("disabled", false);
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureid = res.signatureid
					//$("#issigned").val(1);
					$("#signerror").hide();
					$("#issignedPromNote").val( 1 );
					$('#hiddensignatureid').val( signatureid );
					$('#signature-pad').hide();
					$('#stamp').html( '<img class="img-responsive" style="width: 100%;" src="'+res.agreementsignpath+'">' );
					// $('#stamp').css( "padding","0 18px" );
					// $('#stamp').css( "border-bottom","1px solid black" );
					$("#stamp-date").html( moment().format( "MM/DD/YYYY" ) );
					// $('#stamp-date').css( "padding", "0 18px" );
					// $('#stamp-date').css( "border-bottom", "1px solid black" );
					// location.reload();
					if( validatePrereqs() ) {
						enableFinalizeButton();
					}
				} else {
					$('#signatureError').html('Error: Please draw signature again.');
					//$('#drawmodal').modal('show');
				}
			}
		});
		return false;
	});

	$("#clearSignature").off().on('click', function(event) {
		signaturePad.clear();
		$("#nosignError").hide();
		$('#checkCanvasEmpty').val(0);
	});

	function getCanvas( canvasId ) {
		var wrapper = document.getElementById( canvasId );
		if( wrapper == null ) return null;
		return wrapper.querySelector( "canvas" );
	}

	var wrapper = document.getElementById( "signature-pad-HighCost" );
	if( wrapper == null ) return;
	var acceptSignatureHighCost = document.getElementById( "acceptSignatureHighCost" );
	var clearSignatureHighCost = document.getElementById( "clearSignatureHighCost" );
	var canvas = wrapper.querySelector( "canvas" );
	var signaturePadHighCost = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});

	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeCanvas2() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-HighCost" );
		canvas.width = canvas.offsetWidth * ratio;
		canvas.height = canvas.offsetHeight * ratio;
		canvas.getContext("2d").scale(ratio, ratio);

		signaturePadHighCost.clear();
	}

	// On mobile devices it might make more sense to listen to orientation change,
	// rather than window resize events.
	window.onresize = function onResize() {
		resizeCanvas1();
		resizeCanvas2();
	};
	resizeCanvas2();

	$("#acceptSignatureHighCost").off().on( 'click', function( event ) {
		var data = signaturePadHighCost.toDataURL( 'image/png' );
		var checkCanvasEmptyHighCost = $('#checkCanvasEmptyHighCost').val();
		var hiddensignatureidHighCost = $('#hiddensignatureidHighCost').val();

		if(signaturePadHighCost.isEmpty() && checkCanvasEmptyHighCost != 1)
		{
			$( "#nosignErrorHighCostText" ).html( "" );
			$( "#nosignErrorHighCostText" ).html( "Please sign signature pad." );
			$( "#nosignErrorHighCost" ).show();
			return false;
		}
		if( !$( "#eftaCheckbox" ).is( ":checked" ) ) {
			$( "#nosignErrorHighCostText" ).html( "" );
			$( "#nosignErrorHighCostText" ).html( "Please accept the EFTA by clicking the checkbox." );
			$( "#nosignErrorHighCost" ).show();
			return false;
		}
		let eftaCheckboxsphc = "";
		let businessPurposesCheckboxsphc = "";
		let brokerParticipatedCheckboxsphc ="";
		if( $( "#eftaCheckboxsphc" ).val() == "checked" || $( "#eftaCheckboxsphcServer" ).val() == "checked" ) {
			eftaCheckboxsphc = "checked";
		}
		if( $( "#businessPurposesCheckboxsphc" ).val() == "checked" || $( "#businessCheckboxsphcServer" ).val() == "checked" ) {
			businessPurposesCheckboxsphc = "checked";
		}
		if( $( "#brokerParticipatedCheckboxsphc" ).val() == "checked" || $( "#brokerCheckboxsphcServer" ).val() == "checked" ) {
			brokerParticipatedCheckboxsphc = "checked";
		}
		// var eftaCheckboxsphc = $( "#eftaCheckboxsphc" ).val();
		// var businessPurposesCheckboxsphc = $( "#businessPurposesCheckboxsphc" ).val();
		// var brokerParticipatedCheckboxsphc = $( "#brokerParticipatedCheckboxsphc" ).val();
		$("#acceptSignatureHighCost").attr("disabled", true);
		$("#clearSignatureHighCost").attr("disabled", true);
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid="+hiddensignatureidHighCost,
			data: { imgBase64: data,  esignatureType: 1, eftaCheckbox: eftaCheckboxsphc, brokerParticipatedCheckbox: brokerParticipatedCheckboxsphc, businessPurposesCheckbox: businessPurposesCheckboxsphc },
			dataType:'json',
			beforeSend: function() {
				$("#save_signature_loading").css("display","block");
			}
			,complete:function() { }
			,success:function(res) {
				$("#save_signature_loading").css("display","none");
				$("#acceptSignatureHighCost").attr("disabled", false);
				$("#clearSignatureHighCost").attr("disabled", false);
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureidHighCost = res.signatureid;
					$("#signerrorHighCost").hide();
					$("#issignedHighCost").val( 1 );
					$('#hiddensignatureidHighCost').val( signatureidHighCost );
					$('#signature-pad-HighCost').hide();
					$('#stamp-hc').html( '<img class="img-responsive" style="width: 100%;" src="'+res.agreementsignpath+'">' );
					// $('#stamp-hc').css( "padding","0 18px" );
					// $('#stamp-hc').css( "border-bottom","1px solid black" );
					$("#stamp-hc-date").html( moment().format( "MM/DD/YYYY" ) );
					// $('#stamp-hc-date').css( "padding", "0 18px" );
					// $('#stamp-hc-date').css( "border-bottom", "1px solid black" );

					// location.reload();
					if( validatePrereqs() ) {
						enableFinalizeButton();
					}
				} else {
					$( "#nosignErrorHighCost" ).html( "Please sign signature pad." );
					$( "#nosignErrorHighCost" ).show();
					//$('#signatureError').html('Error: Please draw signature again.');
					//$('#drawmodal').modal('show');
				}
			}
		});
		return false;
	});

	$("#clearSignatureHighCost").off().on('click', function(event) {
		signaturePadHighCost.clear();
		console.log( "clearing canvas: high cost" );
		$("#nosignErrorHighCost").hide();
		$('#checkCanvasEmptyHighCost').val(0);
	});``
}

function initJustEFTAPad() {
	function getCanvas( canvasId ) {
		var wrapper = document.getElementById( canvasId );
		if( wrapper == null ) { return null; }
		return wrapper.querySelector( "canvas" );
	}

	window.onresize = function onResize() {
		resizeEFTCanvas();
	};

	var wrapper =  document.getElementById( "signature-pad-EFT" );
	if( wrapper == null ) {
		return null;
	}
	/* ************ Arbitration Signature Start **************/
	// var acceptSignature = document.getElementById( "acceptSignature" );
	// var clearSignature = document.getElementById( "clearSignature" );
	var canvas = wrapper.querySelector( "canvas" );

	var signaturePadEFT = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});


	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeEFTCanvas() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-EFT" );
		if( canvas ) {
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}

		signaturePadEFT.clear();
	}
	resizeEFTCanvas();

	$( "#acceptSignatureEFT" ).off().on( "click", function( event ) {
		var data = signaturePadEFT.toDataURL( 'image/png' );
		var checkCanvasEmptyEFT = $( "#checkCanvasEmptyEFT" ).val();
		var hiddensignatureidEFT = $( "#hiddensignatureidEFT" ).val();
		var hiddenAccountID = $( "#bankaccountid" ).html();
		console.log( "signaturePadEFT.isEmpty()", signaturePadEFT.isEmpty() );
		console.log( "checkCanvasEmptyEFT", checkCanvasEmptyEFT );
		if( signaturePadEFT.isEmpty() && checkCanvasEmptyEFT != 1 ) {
			$( "#nosignErrorEFTText" ).html( "" );
			$( "#nosignErrorEFTText" ).html( "Please sign the signature pad." );
			$( "#nosignErrorEFT" ).show();
			return false;
		}
		$( "#acceptSignatureEFT" ).attr( "disabled", true );
		$( "#clearSignatureEFT" ).attr( "disabled", true );
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid=" + hiddensignatureidEFT,
			data: {
				imgBase64: data,
				esignatureType: 3,
				accountID: hiddenAccountID
			 },
			dataType: "json",
			beforeSend: function() {
				$ ("#save_signature_loading" ).css( "display", "block" );
			}
			,complete:function() { }
			,success:function( res ) {

				$("#save_signature_loading").css("display","none");
				$("#signInstructionsEFT").css("display","none");
				$("#acceptSignatureEFT").attr("disabled", false);
				$("#clearSignatureEFT").attr("disabled", false);
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureIdEFT = res.signatureid;
					$("#signerrorEFT").hide();
					$("#issignedEFT").val( 1 );
					$('#hiddensignatureidEFT').val( signatureIdEFT );
					$('#signature-pad-EFT').hide();
					$('#stamp-eft').html( '<img class="img-responsive" style="width: 100%;" src="' + res.agreementsignpath + '">' );
					$("#stamp-eft-date").html( moment().format( "MM/DD/YYYY" ) );

					checkStatus();
				} else {
					$( "#nosignErrorEFT" ).html( "Please sign the signature pad." );
					$( "#nosignErrorEFT" ).show();
				}
			}
		});
		return false;
	});

	$( "#clearSignatureEFT" ).off().on( "click", function( event ) {
		signaturePadEFT.clear();
		console.log( "clearing canvas: eft" );
		$( "#nosignErrorEFT" ).hide();
		$( "#checkCanvasEmptyEFT" ).val( 0 );
	} );
	/************* EFT Signature End **************/
}