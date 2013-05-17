<div class="">
    <section class="form-horizontal">
        <div class="control-group">
            <div class="calcbutton">
                <button class="btn btn-success ctrl-calc">Calculate</button>
            </div>
            <div class="calccheckbox">
                <label class="checkbox" for="autocalc"> Auto calculate
                    <input type="checkbox" value="" id="autocalc" checked="checked"> 
                </label>
            </div>
        </div>
    </section>

    <section class="form-horizontal">
        <div class="control-group">
            <h4>Crystal Properties</h4>
        </div>

        <div class="control-group">
            <select id="crystal-dropdown" name="xtal" class="span3">
                {{~it.crystal_Names :value:index}}
                <option value="{{=value}}" {{? value===it.crystal.name}} selected="selected" {{?}}>{{=value}}</option>
                {{~}}
            </select>
        </div>

        <div class="control-group">
            <select id="pm-type-dropdown" name="Type" class="span3">
                {{~it.PM_type_names :value:index}}
                     <option value="{{=value}}" {{? value===it.Type}} selected="selected" {{?}}>{{=value}}</option> 
                {{~}}
            </select>
        </div>

        <div class="control-group">
            <label class="checkbox control-label">
                Calculate theta
                <input id="autocalctheta" type="checkbox" class="inputbox" name="autocalctheta" {{? it.autocalctheta }} checked="checked" {{?}} />
            </label>
        </div>
        <div class="control-group">
            <label class="control-label">
                Theta (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta" value="{{= this.convertTo('deg', parseFloat( it.theta )) }}" />
            </div>
            </label>
        </div>
        <div class="control-group">
            <label class="control-label">
                Length (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="um" class="inputbox" name="L" value="{{= this.convertTo('um', parseFloat( it.L )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label">
                Temperature
            </label>
            <div class="controls">
                <input type="text" data-parse="float" class="inputbox" name="temp" value="{{= parseFloat( it.temp ) }}" />
            </div>
        </div>
    </section>

    <section class="form-horizontal">
        <div class="control-group">
            <h4>Pump Properties</h4>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Wavelength (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nm" class="inputbox" name="lambda_p" value="{{= this.convertTo('nm', parseFloat( it.lambda_p )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Bandwidth FWHM (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nm" class="inputbox" name="p_bw" value="{{= this.convertTo('nm', parseFloat( it.p_bw )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Waist (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="um" class="inputbox" name="W" value="{{= this.convertTo('um', parseFloat( it.W )) }}" />
            </div>
        </div>
    </section>

    <section class="form-horizontal">
        <div class="control-group">
            <h4>Signal Properties</h4>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Wavelength (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nm" class="inputbox" name="lambda_s" value="{{= this.convertTo('nm', parseFloat( it.lambda_s )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Theta_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_s" value="{{= this.convertTo('deg', parseFloat( it.theta_s )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Phi_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi_s" value="{{= this.convertTo('deg', parseFloat( it.phi_s )) }}" />
            </div>
        </div>
    </section>

    <section class="form-horizontal">
        <div class="control-group">
            <h4>Periodic Poling</h4>
        </div>

         <div class="control-group">
            <label class="checkbox control-label">
                Calculate poling period
                <input type="checkbox" data-parse="float" class="checkbox" name="autocalcpp" {{? it.autocalcpp }} checked="checked" {{?}} />
            </label>
        </div>

        <div class="control-group">   
            <label class="control-label">
                Poling Period (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="um" class="inputbox" name="poling_period" value="{{= this.convertTo('um', parseFloat( it.poling_period )) }}" />
            </div>
        </div>

        <div class="control-group">   
            <label class="control-label">
                Theta_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_s" value="{{= this.convertTo('deg', parseFloat( it.theta_s )) }}" />
            </div>
        </div>

        <div class="control-group">   
            <label class="control-label">
                Phi_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi_s" value="{{= this.convertTo('deg', parseFloat( it.phi_s )) }}" />
            </div>
        </div>
    </section>

</div>