<div class="">
    <section class="form-horizontal">
        <div class="control-group share-wrap">
            <div class="pull-left">
                <button class="btn ctrl-share">Share</button>
            </div>
            <div class="controls">
                <input type="text" value="" id="share-url"> 
            </div>
        </div>
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
            <select id="crystal-dropdown" name="xtal" class="full">
                {{~this.PhaseMatch.Crystals.keys() :value:index}}
                <option value="{{= value }}" {{? value === it.crystal.id }} selected="selected" {{?}}>{{= this.PhaseMatch.Crystals(value).name }}</option>
                {{~}}
            </select>
        </div>

        <div class="control-group">
            <select id="pm-type-dropdown" name="type" class="full">
                {{~this.PhaseMatch.PMTypes :value:index}}
                     <option value="{{=index}}" {{? index === it.type }} selected="selected" {{?}}>{{=value}}</option> 
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
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta" value="{{= this.converter.to('deg', parseFloat( it.theta )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label">
                Phi (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi" value="{{= this.converter.to('deg', parseFloat( it.phi )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label">
                Length (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="L" value="{{= this.converter.to('micro', parseFloat( it.L )) }}" />
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
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lambda_p" value="{{= this.converter.to('nano', parseFloat( it.lambda_p )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Bandwidth FWHM (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="p_bw" value="{{= this.converter.to('nano', parseFloat( it.p_bw )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Waist (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="W" value="{{= this.converter.to('micro', parseFloat( it.W )) }}" />
            </div>
        </div>
    </section>

    <!-- Signal Properties -->
    <section class="form-horizontal">
        <div class="control-group">
            <h4>Signal Properties</h4>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Wavelength (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lambda_s" value="{{= this.converter.to('nano', parseFloat( it.lambda_s )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Theta_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_s" value="{{= this.converter.to('deg', parseFloat( it.theta_s )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Phi_s (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi_s" value="{{= this.converter.to('deg', parseFloat( it.phi_s )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Waist x dir (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="W_sx" value="{{= this.converter.to('deg', parseFloat( it.W_sx )) }}" />
            </div>
        </div>
        <div class="control-group">   
            <label class="control-label">
                Waist y dir (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="W_sy" value="{{= this.converter.to('deg', parseFloat( it.W_sy )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="checkbox control-label">
                Brute force calculation
                <input id="brute_force" type="checkbox" class="inputbox" name="brute_force" {{? it.brute_force }} checked="checked" {{?}} />
            </label>
        </div>
    </section>

    <!-- Periodic Poling Properties -->
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
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="poling_period" value="{{= this.converter.to('micro', parseFloat( it.poling_period )) }}" />
            </div>
        </div>
    </section>

</div>