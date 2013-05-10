<div class="row-fluid">
    <div class="span4">
        <h4>Crystal Properties</h4>
         <div class="Form">   
            <label>
                Pump Wavelength
                <input type="text" name="lambda_p" value="{{= it.lambda_p || ''}}" />
            </label>
        </div>
        <div class="Form">
            <label>
                Pump angle
                <input type="text" name="theta" value="{{= it.theta || ''}}" />
            </label>
        </div>
        <div class="Form">
            <label>
                Calculate theta
                <input type="checkbox" name="autocalctheta" {{? it.autocalctheta }} checked="checked" {{?}} />
            </label>
        </div>
        <div class="Form">
            <label>
                Length
                <input type="text" name="L" value="{{= it.L || ''}}" />
            </label>
        </div>
    </div>

    <div class="span4">
        <h4>Pump Properties</h4>
        <div class="Form">
            <label>
                Other setting
                <input type="text" value="" />
            </label>
        </div>
    </div>

    <div class="span4">
        <h4>Signal Properties</h4>
        <div class="Form">
            <label>
                Other setting
                <input type="text" value="" />
            </label>
        </div>
    </div>
</div>