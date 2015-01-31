<div class="inner">

    <div class="navbar navbar-inverse">
        <div class="navbar-inner">
          <div class="container">

            <!-- <h1 class="site-title">SPDCalc</h1> -->
            <div class="site-logo">
            </div>

            <div class="ui-module-wrap pull-left">
                <select tabindex="1" class="span3" id="ui-modules">
                    <option value="jsa">Joint Spectral Intensity</option>
                    <option value="curves">Phasematching Curves</option>
                    <!-- <option value="xy">Emission Angle</option> -->
                    <option value="heralding1d">Heralding Joint Spectrum</option>
                    <option value="heralding2d">Heralding and Rates Optimization</option>
                    <option value="jsa-hom">Hong-Ou-Mandel dip</option>
                    <option value="jsa-hom-bunch">Hong-Ou-Mandel bunching</option>
                    <option value="jsa-2hom">Two Source Hong-Ou-Mandel</option>
                    <!-- <option value="heralding">Heralding Efficency</option> -->
                    <!-- <option value="modesolver">Mode Solver</option> -->
<!--                     <option value="efficiency">Efficiency map</option>
 -->                    <option value="schmidt-2d">Spectral Purity Optimization</option>
                    <!-- <option value="kitchen_sink">Kitchen Sink</option> -->
                </select>
            </div>

            <!-- <ul class="nav">
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
                      </ul>
                    </li>
                    <li><a href="#">Element Three</a></li>
                  </ul>
                </li>
                <li>
                  <a href="#">
                    About
                  </a>
                </li>
              </ul> -->

          </div>
        </div>
    </div>

    <div class="upper row">

        <div class="options-wrap span3">

            <div id="parameters"></div>


            <div class="row-fluid">
                <h2 class="title"></h2>

            </div>
                <section class="form-horizontal">

                    <div class="row-fluid">
                        <div class="control-group">
                            <div class="calcbutton">
                                <button class="btn ctrl-calc">Calculate</button>
                            </div>
                        </div>
                    </div>

                    <div class="row-fluid">
                        <div class="control-group">
                            <div class="">
                                <label class="checkbox" for="autocalc"> Auto calculate
                                    <input type="checkbox" value="" id="autocalc" checked="checked">
                                </label>
                            </div>
                        </div>
                    </div>

                   <div class="row-fluid">
                            <div class="control-group">
                                <button class="btn ctrl-share">Share</button>
                                <input type="text" value="" id="share-url">
                            </div>
                    </div>
                </section>

            </div>

            <!-- <div class="row-fluid">
                <h2 class="title"></h2>

                </div>
                    <section class="form-horizontal">
                            <div class="control-group ">
                                <div class="">
                                    <button class="btn ctrl-share">Share</button>
                                </div>
                                <div class="controls">
                                    <input type="text" value="" id="share-url">
                                </div>
                            </div>

                            <div class="control-group">
                                <div class="calccheckbox">
                                    <label class="checkbox" for="autocalc"> Auto calculate
                                        <input type="checkbox" value="" id="autocalc" checked="checked">
                                    </label>
                                </div>
                            </div>

                            <div class="control-group">
                                <div class="calcbutton">
                                    <button class="btn btn-success ctrl-calc">Calculate</button>
                                </div>
                            </div>

                        </section>

            </div> -->


        <div class="right">

            <div id="main"></div>
        </div>

    </div>
    <div class="lower">

        <!-- <div id="logs"></div> -->
        <div id="docs"></div>
    </div>
</div>