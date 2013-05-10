<div class="row-fluid">
    <div class="span3">
        <label>
            Pump Wavelength
            <input type="text" name="lambda_p" value="{{= it.lambda_p || ''}}" />
        </label>
    </div>
    <div class="span3">
        <label>
            Pump angle
            <input type="text" name="theta" value="{{= it.theta || ''}}" />
        </label>
    </div>
    <div class="span3">
        <label>
            Calculate theta
            <input type="checkbox" name="autocalctheta" {{? it.autocalctheta }} checked="checked" {{?}} />
        </label>
    </div>
    <div class="span3">
        <label>
            Other setting
            <input type="text" value="" />
        </label>
    </div>
</div>