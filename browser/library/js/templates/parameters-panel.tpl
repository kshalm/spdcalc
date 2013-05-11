<div class="">
    <div class="Form">
        <div class="calcbutton">
            <button class="btn btn-success ctrl-calc">Calculate</button>
        </div>
        <div class="calccheckbox">
            <label class="checkbox" for="autocalc"> Auto calculate
                <input type="checkbox" value="" id="autocalc"> 
            </label>
        </div>
    </div>

    <div class="sp4">
        <div class="Form">
            <h4>Crystal Properties</h4>
        </div>
        <div class="Form">
            <label>
                Automatically calculate theta
            </label>
            <div class="flatinputbox">
                <input type="checkbox" class="inputbox" name="autocalctheta" {{? it.autocalctheta }} checked="checked" {{?}} />
            </div>
        </div>
        <div class="Form">
            <label>
                Theta (deg)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="theta" value="{{= it.theta || ''}}" />
            </div>
            </label>
        </div>
        <div class="Form">
            <label>
                Length (um)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="L" value="{{= it.L || ''}}" />
            </div>
        </div>
        <div class="Form">
            <label>
                Temperature
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="Temp" value="{{= it.Temp || ''}}" />
            </div>
        </div>
    </div>

    <div class="sp4">
        <div class="Form">
            <h4>Pump Properties</h4>
        </div>
        <div class="Form">   
            <label>
                Wavelength
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="lambda_p" value="{{= it.lambda_p || ''}}" />
            </div>
        </div>
        <div class="Form">   
            <label>
                Bandwidth FWHM (nm)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="p_bw" value="{{= it.p_bw || ''}}" />
            </div>
        </div>
        <div class="Form">   
            <label>
                Waist (um)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="W" value="{{= it.W || ''}}" />
            </div>
        </div>
    </div>

    <div class="sp4">
        <div class="Form">
            <h4>Signal Properties</h4>
        </div>
        <div class="Form">   
            <label>
                Wavelength
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="lambda_s" value="{{= it.lambda_s || ''}}" />
            </div>
        </div>
        <div class="Form">   
            <label>
                Theta_s (deg)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="theta_s" value="{{= it.theta_s || ''}}" />
            </div>
        </div>
        <div class="Form">   
            <label>
                Phi_s (deg)
            </label>
            <div class="flatinputbox">
                <input type="text" class="inputbox" name="phi_s" value="{{= it.phi_s || ''}}" />
            </div>
        </div>
    </div>
</div>