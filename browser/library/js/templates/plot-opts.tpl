<section class="form-horizontal">

    <!-- Plot Options -->
    <!-- <h3>Plot Options</h3> -->

    <div class="control-group">
        <label class="checkbox control-label calc_plotopts" for="autocalc_plotopts">
            Auto calculate plot options
            <input type="checkbox" name="autocalc_plotopts" id="autocalc_plotopts" {{? it.autocalc_plotopts }}checked="checked"{{?}}>
        </label>
    </div>

    <div id="plot-opt-grid_size">
        <div class="control-group">
            <label class="control-label grid_size">
                Grid size
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="grid_size" value="{{= parseFloat( it.grid_size ) }}" />
            </div>
        </div>
    </div>

    <!-- Grid size for 2D heralding plot. -->
    <div id="plot-opt-grid_size_heralding">
        <div class="control-group">
            <label class="control-label grid_size">
                Grid size
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="grid_size_heralding" value="{{= parseFloat( it.grid_size_heralding ) }}" />
            </div>
        </div>
    </div>

    <!-- Grid size for 2D heralding plot. -->
    <div id="plot-opt-grid_size_heralding_JSI">
        <div class="control-group">
            <label class="control-label grid_size">
                Grid size
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="grid_size_heralding_JSI" value="{{= parseFloat( it.grid_size_heralding_JSI ) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-T_2HOM">
        <div class="control-group">
            <label class="control-label T_2HOM">
                Number of time delay points
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="T_2HOM" value="{{= parseFloat( it.T_2HOM ) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-npts-heralding-waist">
        <div class="control-group">
            <label class="control-label T_2HOM">
                Number of collection waist points
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="n_pts_eff_1d" value="{{= parseFloat( it.n_pts_eff_1d ) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-grid_size_ms">
        <div class="control-group">
            <label class="control-label grid_size_ms">
                Grid size
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="grid_size_ms" value="{{= parseFloat( it.grid_size_ms ) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-grid_size_schmidt">
        <div class="control-group">
            <label class="control-label grid_size_schmidt">
                Grid size
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="" class="inputbox" name="grid_size_schmidt" value="{{= parseFloat( it.grid_size_schmidt ) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-signal-wavelength">
        <label class="plot_lambda_s">Signal Wavelength</label>
        <div class="control-group">
            <label class="control-label">
                Start (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="ls_start" value="{{= this.converter.to('nano', parseFloat( it.ls_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="ls_stop" value="{{= this.converter.to('nano', parseFloat( it.ls_stop )) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-idler-wavelength">
        <label class="plot_lambda_i">Idler Wavelength</label>
        <div class="control-group">
            <label class="control-label">
                Start (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="li_start" value="{{= this.converter.to('nano', parseFloat( it.li_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="li_stop" value="{{= this.converter.to('nano', parseFloat( it.li_stop )) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-pump-wavelength">
        <label class="plot_lambda_p">Pump Wavelength</label>
        <div class="control-group">
            <label class="control-label">
                Start (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lp_start" value="{{= this.converter.to('nano', parseFloat( it.lp_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="lp_stop" value="{{= this.converter.to('nano', parseFloat( it.lp_stop )) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-theta">
        <label class="plot_theta_s">Signal Theta Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_start" value="{{= this.converter.to('deg', parseFloat( it.theta_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="theta_stop" value="{{= this.converter.to('deg', parseFloat( it.theta_stop )) }}" />
            </div>
        </div>
    </div>

    <div id="plot-opt-time-delay">
        <label class="plot_time_delay">Time Delay Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (fs)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="femto" class="inputbox" name="delT_start" value="{{= this.converter.to('femto', parseFloat( it.delT_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (fs)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="femto" class="inputbox" name="delT_stop" value="{{= this.converter.to('femto', parseFloat( it.delT_stop )) }}" />
            </div>
        </div>
    </div>

    <!-- Now for the spectral purity calculator parameters.-->
    <!-- Crystal Length -->
    <div id="plot-opt-xtal_length_range">
        <label class="plot_crystal_length">Crystal Length Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="xtal_l_start" value="{{= this.converter.to('micro', parseFloat( it.xtal_l_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="xtal_l_stop" value="{{= this.converter.to('micro', parseFloat( it.xtal_l_stop )) }}" />
            </div>
        </div>
    </div>
    <!-- Pump Bandwidth range -->
    <div id="plot-opt-pump_bw_range">
        <label class="plot_pump_bw">Pump Bandwidth Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="bw_start" value="{{= this.converter.to('nano', parseFloat( it.bw_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="bw_stop" value="{{= this.converter.to('nano', parseFloat( it.bw_stop )) }}" />
            </div>
        </div>
    </div>


    <!-- Theta range to plot for PM curves -->
    <div id="plot-opt-pump-theta">
        <label class="plot_pump_theta">Crystal Theta Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="pump_theta_start" value="{{= this.converter.to('deg', parseFloat( it.pump_theta_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="pump_theta_stop" value="{{= this.converter.to('deg', parseFloat( it.pump_theta_stop )) }}" />
            </div>
        </div>
    </div>


    <!-- Pump Phi range to plot for PM curves -->
    <div id="plot-opt-pump-phi">
        <label class="plot_pump_phi">Crystal Phi Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="pump_phi_start" value="{{= this.converter.to('deg', parseFloat( it.pump_phi_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="deg" class="inputbox" name="pump_phi_stop" value="{{= this.converter.to('deg', parseFloat( it.pump_phi_stop )) }}" />
            </div>
        </div>
    </div>

    <!-- Poling Period range to plot for PM curves -->
    <div id="plot-opt-poling-period">
        <label class="plot_poling_period">Poling Period Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="poling_period_start" value="{{= this.converter.to('micro', parseFloat( it.poling_period_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="poling_period_stop" value="{{= this.converter.to('micro', parseFloat( it.poling_period_stop )) }}" />
            </div>
        </div>
    </div>


    <!-- Signal Wavelength Range for the Phasematching curves.  -->
    <div id="plot-opt-pm-signal-wavelength">
        <label class="plot_pm_signal_wavelength">Signal Wavelength Range</label>
        <div class="control-group">
            <label class="control-label">
                Start (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="pm_signal_wavelength_start" value="{{= this.converter.to('nano', parseFloat( it.pm_signal_wavelength_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (deg)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="pm_signal_wavelength_stop" value="{{= this.converter.to('nano', parseFloat( it.pm_signal_wavelength_stop )) }}" />
            </div>
        </div>
    </div>


    <!-- Modesolver Signal bandwidth.  -->
    <div id="plot-opt-collection-bw">
        <!-- <label class="plot_pm_signal_wavelength">Signal Wavelength Range</label> -->
        <div class="control-group">
            <label class="control-label">
                FWHM Filter bandwidth (nm)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="nano" class="inputbox" name="collection_bw" value="{{= this.converter.to('nano', parseFloat( it.collection_bw )) }}" />
            </div>
        </div>

    </div>



    <!-- Pump Waist Range for the Heralding 2D calculations -->
    <div id="plot-opt-pump-waist">
        <label class="plot_wp">Pump Waist (1/e^2)</label>
        <div class="control-group">
            <label class="control-label">
                Start (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="Wp_start" value="{{= this.converter.to('micro', parseFloat( it.Wp_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="Wp_stop" value="{{= this.converter.to('micro', parseFloat( it.Wp_stop )) }}" />
            </div>
        </div>
    </div>

    <!-- Signal Waist Range for the Heralding 2D calculations -->
    <div id="plot-opt-signal-waist">
        <label class="plot_ws">Signal Waist (1/e^2)</label>
        <div class="control-group">
            <label class="control-label">
                Start (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="Ws_start" value="{{= this.converter.to('micro', parseFloat( it.Ws_start )) }}" />
            </div>
        </div>

        <div class="control-group">
            <label class="control-label">
                Stop (um)
            </label>
            <div class="controls">
                <input type="text" data-parse="float" data-unit="micro" class="inputbox" name="Ws_stop" value="{{= this.converter.to('micro', parseFloat( it.Ws_stop )) }}" />
            </div>
        </div>
    </div>



</section>