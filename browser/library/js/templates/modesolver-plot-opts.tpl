<section class="form-horizontal">

    <!-- Modesolver Plot Options -->
    <h3>Plot Options</h3>

    <div class="control-group">
        <label class="checkbox control-label" for="autocalc_plotopts"> 
            Auto calculate plot options
            <input type="checkbox" name="autocalc_plotopts" id="autocalc_plotopts" {{? it.autocalc_plotopts }}checked="checked"{{?}}> 
        </label>
    </div>

    <label>Signal Wavelength</label>
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

    <label>Idler Wavelength</label>
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
</section>