<div>

    <div class="parameters-wrap">
        <div class="row-fluid">
            <h2 class="title">Crystal Options</h2>

            <div class="btn-wrap ">
                <button class="btn collapse-ctrl" id="collapse-crystal">&#x2296;</button>
            </div>
        </div>

        <section class="form-horizontal">
            <div class="control-group">
                <!-- <h4>Crystal Properties</h4> -->
            </div>

            <div class="control-group">
                <select id="crystal-dropdown" name="crystal" class="full">
                    {{~this.PhaseMatch.Crystals.keys() :value:index}}
                    <option value="{{= value }}" {{? value === it.crystal }} selected="selected" {{?}}>{{= this.PhaseMatch.Crystals(value).name }}</option>
                    {{~}}
                </select>
            </div>

            <div class="control-group">
                <select id="pm-type-dropdown" name="type" class="full">
                    {{~this.PhaseMatch.PMTypes :value:index}}
                         <option value="{{=value}}" {{? value === it.type }} selected="selected" {{?}}>{{=value}}</option>
                    {{~}}
                </select>
            </div>

            <div class="control-group">
                <label class="checkbox control-label calc_theta">
                    Calculate theta
                    <input id="autocalctheta" type="checkbox" class="inputbox" name="autocalctheta" {{? it.autocalctheta }} checked="checked" {{?}} />
                </label>
            </div>
            <div class="control-group">
                <label class="control-label theta">
                    Theta (deg)
                </label>
                <div class="controls">
                    <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta" value="{{= this.converter.to('deg', parseFloat( it.theta )) }}" />
                </div>
            </div>
            <div class="control-group">
                <label class="control-label phi">
                    Phi (deg)
                </label>
                <div class="controls">
                    <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi" value="{{= this.converter.to('deg', parseFloat( it.phi )) }}" />
                </div>
            </div>
            <div class="control-group">
                <label class="control-label length">
                    Length (um)
                </label>
                <div class="controls">
                    <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="L" value="{{= this.converter.to('micro', parseFloat( it.L )) }}" />
                </div>
            </div>
            <div class="control-group">
                <label class="control-label temperature">
                    Temperature
                </label>
                <div class="controls">
                    <input type="text" data-parse="float" class="inputbox" name="temp" value="{{= parseFloat( it.temp ) }}" />
                </div>
            </div>
        </section>
    </div>

    <!-- Pump properties -->

<div class="parameters-wrap collapsed">
    <div class="row-fluid">
        <h2 class="title">Pump Options</h2>

        <div class="btn-wrap ">
            <button class="btn collapse-ctrl" id="collapse-pump">&#x2295;</button>
        </div>
    </div>

    <section class="form-horizontal">
        <div class="control-group">
            <!-- <h4>Pump Properties</h4> -->
        </div>
        <div class="control-group">
            <label class="control-label lambda_p">
                Wavelength (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lambda_p" value="{{= this.converter.to('nano', parseFloat( it.lambda_p )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label pump_bw">
                Bandwidth FWHM (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="p_bw" value="{{= this.converter.to('nano', parseFloat( it.p_bw )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label waist_p">
                Waist 1/e^2 (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="W" value="{{= this.converter.to('micro', parseFloat( it.W )) }}" />
            </div>
        </div>
    </section>
</div>

<div class="parameters-wrap collapsed">
    <div class="row-fluid">
        <h2 class="title">Signal Options</h2>

        <div class="btn-wrap ">
            <button class="btn collapse-ctrl" id="collapse-signal">&#x2295;</button>
        </div>
    </div>
    <!-- Signal Properties -->
    <section class="form-horizontal">
        <div class="control-group">
            <!-- <h4>Signal Properties</h4> -->
        </div>

        <div class="control-group">
            <label class="checkbox control-label fibercouple">
                Enable fiber coupling
                <input id="fibercouple" type="checkbox" class="inputbox" name="calcfibercoupling" {{? it.calcfibercoupling }} checked="checked" {{?}} />
            </label>
        </div>
        <div class="control-group">
            <label class="control-label lambda_s">
                Wavelength (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lambda_s" value="{{= this.converter.to('nano', parseFloat( it.lambda_s )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label theta_s">
                Theta (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_s_e" value="{{= this.converter.to('deg', parseFloat( it.theta_s_e )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label phi_s">
                Phi (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="phi_s" value="{{= this.converter.to('deg', parseFloat( it.phi_s )) }}" />
            </div>
        </div>
        <div class="control-group">
            <label class="control-label">
                Waist 1/e^2 (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="W_sx" value="{{= this.converter.to('micro', parseFloat( it.W_sx )) }}" />
            </div>
        </div>
       <!--  <div class="control-group">
            <label class="control-label">
                Waist y dir (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="W_sy" value="{{= this.converter.to('deg', parseFloat( it.W_sy )) }}" />
            </div>
        </div> -->
        <!-- <div class="control-group">
            <label class="checkbox control-label brute_force">
                Brute force calculation
                <input id="brute_force" type="checkbox" class="inputbox" name="brute_force" {{? it.brute_force }} checked="checked" {{?}} />
            </label>
        </div> -->
    </section>
</div>


    <!-- Periodic Poling Properties -->

    <div class="parameters-wrap collapsed">
        <div class="row-fluid">
            <h2 class="title">Periodic Poling</h2>

            <div class="btn-wrap ">
                <button class="btn collapse-ctrl" id="collapse-poling">&#x2295;</button>
            </div>
        </div>
        <section class="form-horizontal">
            <div class="control-group">
                <!-- <h4>Periodic Poling</h4> -->
            </div>

            <div class="control-group">
                <label class="checkbox control-label">
                    Enable periodic poling
                    <input type="checkbox" data-parse="float" class="checkbox" id="enable-calc-pp" name="enable_pp" {{? it.enable_pp }} checked="checked" {{?}} />
                </label>
            </div>

            <div id="periodic-poling-options"><!-- Start the periodic poling group  -->

                 <div class="control-group">
                    <label class="checkbox control-label calc-pp">
                        Calculate poling period
                        <input type="checkbox" data-parse="float" id="autocalcppid" class="checkbox" name="autocalcpp" {{? it.autocalcpp }} checked="checked" {{?}} />
                    </label>
                </div>

                <div class="control-group">
                    <label class="control-label poling_period">
                        Poling period (um)
                    </label>
                    <div class="controls">
                        <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="poling_period" value="{{= this.converter.to('micro', parseFloat( it.poling_period )) }}" />
                    </div>
                </div>

                <div class="control-group">
                    <label class="checkbox control-label calc_apodization">
                        Enable apodization
                        <input type="checkbox" data-parse="float" class="checkbox" name="calc_apodization" {{? it.calc_apodization }} checked="checked" {{?}} />
                    </label>
                </div>

                <div class="control-group ">
                    <label class="control-label apodization_fwhm">
                        Apodization FWHM (um)
                    </label>
                    <div class="controls">
                        <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="apodization_FWHM" value="{{= this.converter.to('micro', parseFloat( it.apodization_FWHM )) }}" />
                    </div>
                </div>

                <div class="control-group">
                    <label class="control-label apodization_steps">
                        Apodization steps
                    </label>
                    <div class="controls">
                        <input type="text" data-parse="float" data-unit="" class="inputbox" name="apodization" value="{{=  parseFloat( it.apodization ) }}" />
                    </div>
            </div><!-- end the periodic poling group  -->

        </section>
    </div>

    <div class="parameters-wrap collapsed last-parameters">
        <div class="row-fluid">
            <h2 class="title">Plot Options</h2>

            <div class="btn-wrap ">
                <button class="btn collapse-ctrl" id="collapse-plotopts">&#x2295;</button>
            </div>
        </div>
        <div id="plot-opts"></div>
    </div>

</div>
