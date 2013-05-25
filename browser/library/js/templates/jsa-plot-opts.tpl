<section class="form-horizontal">

    <!-- JSA Plot Options -->
    <h3>Plot Options</h3>

    <div class="control-group">
        <label class="control-label">
            Lambda Start (nm)
        </label>
        <div class="controls">
            <input type="text" data-parse="float" data-unit="nm" class="inputbox" name="l_start" value="{{= this.converter.to('nm', parseFloat( it.l_start )) }}" />
        </div>
    </div>

    <div class="control-group">
        <label class="control-label">
            Lambda Stop (nm)
        </label>
        <div class="controls">
            <input type="text" data-parse="float" data-unit="nm" class="inputbox" name="l_stop" value="{{= this.converter.to('nm', parseFloat( it.l_stop )) }}" />
        </div>
    </div>
</section>