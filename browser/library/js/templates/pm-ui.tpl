<div class="inner">
    <div class="upper">
        <div class="navbar navbar-inverse">
            <div class="navbar-inner">
              <div class="container">

                <h1 class="site-title">PhaseMatch</h1>

                <div class="ui-module-wrap pull-left">
                    <select tabindex="1" class="span3" id="ui-modules">
                        <option value="jsa">JSA</option>
                        <option value="hom">Hong Ou Mandel</option>
                        <option value="pm-xy">PM XY</option>
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

        <div id="main"></div>

    </div>
    <div class="lower">
        <div id="parameters-wrap">
            <div class="row-fluid">
                <h2 class="span6 title">Parameters</h2>
                <div class="span4">
                    <button class="btn btn-success ctrl-calc">Calculate</button>
                    <label class="checkbox" for="autocalc">
                        <input type="checkbox" value="" id="autocalc">
                        Auto calculate
                    </label>
                </div>
                <div class="btn-wrap span2">
                    <button class="btn collapse-ctrl">collapse</button>
                </div>
            </div>
            <div id="parameters"></div>
        </div>
        <div id="logs"></div>
    </div>
</div>