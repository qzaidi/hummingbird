HummingbirdTracker = {

  param:function(a) {
    var             s =[], add = function(key, value) {
      value = (value instanceof Function) ? value() : value;
      s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    };

    for (var prefix in a)
      this.buildParams(prefix, a[prefix], add);

    return s.join("&").replace(/%20/g, "+");
  },

  buildParams:function(name, val, add) {
    if (val instanceof Array || val instanceof Object) {
      for (var idx in val) {
        this.buildParams(name + '[' + idx + ']', val[idx], add);
      }
    } else {
      add(name, val);
    }
  },

  track: function(env) {
    var baseURL = (document.location.protocol == "https:")
                         ?env.trackingServerSecure:env.trackingServer;

    delete env.trackingServer;
    delete env.trackingServerSecure;

    env.u = document.location.href;
    env.bw = window.innerWidth;
    env.bh = window.innerHeight;
    /*
    env.guid = document.cookie.match(/guid=([^\_]*)_([^;]*)/)[2];
    env.gen = document.cookie.match(/gender=([^;]*);/)[1];
    env.uid = document.cookie.match(/user_id=([^\_]*)_([^;]*)/)[2];
    */

    if(document.referrer && document.referrer != "") {
          env.ref = document.referrer;
    }

    var trackingImage = new Image();
    trackingImage.src = baseURL + '/tracking.gif?' + this.param(env);
    console.log(trackingImage.src);
  }
};


/* Usage
 *
 * include this script in the header (of an iframe) and call this in the body
 *
 * <script type="text/javascript">
 * var env = { 
 *              trackingServer: '',
 *              trackingSecureServer: ''
 *             // any other parameters that you want to be logged.
 *            };
 *
 * HummingbirdTracker.track(env);
 * </script>
 */
