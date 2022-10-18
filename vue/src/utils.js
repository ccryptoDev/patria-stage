export function formatFormData(data) {
    // {'foo.bar...': 'buzz'} => {foo: {bar: 'buzz'}}
    return Object.entries(data).reduce((out, [key, value]) => {
        if (!key.includes(".")) {
            out[key] = value;
        } else {
            let ref = out;

            key.split(".").forEach((nestedKey, index, arr) => {
                ref[nestedKey] = ref[nestedKey] || {};
                if (index === arr.length - 1) {
                    ref[nestedKey] = value;
                } else {
                    ref = ref[nestedKey];
                }
            });
        }
        return out;
    }, {});
}
export const toNormalWords = (str) => {
    // foo.barBaz -> barBaz
    const strBuffer = str.includes('.') ?
        str.split(".").pop() : str;
    // barBaz_ -> BarBaz
    const capStr = strBuffer
        .charAt(0)
        .toUpperCase() + strBuffer
            .slice(1)
            .replaceAll(/_/g, " ");
    // BarBaz -> Bar Baz
    return capStr.replace(/([A-Z])/g, ' $1').trim();
}

function _$format( number, currency, decimals, label ) {
	decimals = ( typeof decimals == "number" ? decimals : 2 );
	currency = ( typeof currency == "undefined" || currency );
	if( typeof number == "string" ) {
		number = parseFloat( number.replace( /[^0-9.]/g, "" ) );
	}
	if( typeof number !== "number" ) number = 0;
	const value = number.toLocaleString( "en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals } );
	return ( currency ? label ? `$${value}`: value: value );
}

export function $format( number, currency, decimals ) {
	return _$format( number, currency, decimals, true );
}