define(function(){

    var units = {
        micro: 1e-6,
        nano: 1e-9,
        pico: 1e-12,
        femto: 1e-15,
        deg: Math.PI / 180,
    };

    function convertFrom( unit, val ){

        if (!val) return 0;

        if ( !(unit in units) ){
            throw 'Unit "' + unit + '" not defined in units.';
        }

        return val * units[ unit ];
    }

    function convertTo( unit, val, precision ){

        if (!val) return 0;

        precision = precision === undefined ? 2 : precision;

        if ( !(unit in units) ){
            throw 'Unit "' + unit + '" not defined in units.';
        }

        return (val / units[ unit ]).toFixed( precision );
    }

    return {

        from: convertFrom,
        to: convertTo
    };
});