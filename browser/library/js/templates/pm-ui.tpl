<div class="inner">
    <div class="upper">
        <div class="navbar navbar-inverse">
            <div class="navbar-inner">
              <div class="container">

                <h1 class="site-title">PhaseMatch</h1>

                <div class="ui-module-wrap pull-left">
                    <select tabindex="1" class="span3" id="ui-modules">
                        <option value="jsa">Joint Spectral Amplitude</option>
                        <option value="xy">Emission Angle</option>
                        <option value="jsa-hom">Hong-Ou-Mandel</option>
                        <option value="modesolver">Mode Solver</option>
                        <option value="schmidt-2d">Spectral Purity</option>
                        <option value="kitchen_sink">Kitchen Sink</option>
                    </select>
                </div>
                
                <ul class="nav">
                    <li>
                      <a href="#">
                        Dropdown
                        <span class="navbar-unread">1</span>
                      </a>
                      <ul>
                        <li><a href="#">Element One</a></li>
                        <li>
                          <a href="#">Sub menu</a>
                          <ul>
                            <li><a href="#">Element One</a></li>
                            <li><a href="#">Element Two</a></li>
                            <li><a href="#">Element Three</a></li>
                          </ul> <!-- /Sub menu -->
                        </li>
                        <li><a href="#">Element Three</a></li>
                      </ul> <!-- /Sub menu -->
                    </li>
                    <li>
                      <a href="#">
                        About
                      </a>
                    </li>
                  </ul>
              </div>
            </div>
        </div>

        <div class="options-wrap">

            <div id="parameters"></div>

            <!-- Plot options -->

            <div class="parameters-wrap collapsed">
                <div class="row-fluid">
                    <h2 class="title">Plot Options</h2>
                    
                    <div class="btn-wrap ">
                        <button class="btn collapse-ctrl" id="collapse-plotopts">-</button>
                    </div>
                </div>
                <div id="plot-opts"></div>
            </div>

             <!-- <div class="parameters-wrap">
                <div class="row-fluid">
                    <div>
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
                        </div>
                </div>
            </div> -->




        </div>

        <div class="right">

            <div id="main"></div>
        </div>

    </div>
    <div class="lower">
        
        <div id="logs"></div>
    </div>
</div>