// Google Analytics Tracking
var _gaq = _gaq || [];
(function() {
  var pluginUrl = '//www.google-analytics.com/plugins/ga/inpage_linkid.js';
  _gaq.push(['_require', 'inpage_linkid', pluginUrl]);
  _gaq.push(['_setAccount', 'UA-16927549-1']);
  _gaq.push(['_setDomainName', 'pubnub.com']);
  _gaq.push(['_trackPageview']);
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

if(window.location.hostname === 'www.pubnub.com' || window.location.hostname === 'pubnub.com' ){
    window['CONFIG'] = {
        'pardot_account_id': '29622',
        'pardot_campaign_id': '22674'
    };
}
else {
    window['CONFIG'] = {
        'pardot_account_id': '31022',
        'pardot_campaign_id': '1932'
    };

}

// Pardot tracking
piAId = CONFIG['pardot_account_id'];
piCId = CONFIG['pardot_campaign_id'];

if (!PUBNUB.unbind) {
  PUBNUB.unbind = function( type, el, fn) {
    if ( el.removeEventListener ) el.removeEventListener( type, el, false );
    else if ( el.detachEvent ) el.detachEvent( 'on' + type, el, false );
    else  el[ 'on' + type ] = null;
  };
}

PUBNUB.bind('load', window, function asyncLoadPardot() {
  var s = document.createElement('script'); s.type = 'text/javascript';
  s.src = ('https:' == document.location.protocol ? 'https://pi' : 'http://cdn') + '.pardot.com/pd.js';
  var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c);
});

var ie = (function(){

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

    return v > 4 ? v : undef;

}());

if(!document.getElementsByClassName) {
  getElementsByClassName = function(className) {
      return this.querySelectorAll && this.querySelectorAll("." + className) ||
      (function(classname) {
          var elements = [];
          var re = new RegExp('(^| )'+classname+'( |$)');
          var results = this.getElementsByTagName("*");
          for( var idx = 0, length = els.length; idx < length; idx++ ) {
            if( re.test( els[ idx ].className ) ) {
              a.push( els[ idx ] );
            };
          }
          return elements;
      }(className));
  };
  document.getElementsByClassName = getElementsByClassName;
  Element.prototype.getElementsByClassName = getElementsByClassName;
}

window.Modal = function() {};

Modal.prototype = {
  clonedEl : false,
  open: function(target, fn) {
    var self = this;

    if (!self.clonedEl) {
      var modalWrap = document.getElementById(target);
      modalWrap && (self.clonedEl = modalWrap.cloneNode(true));
      modalWrap && modalWrap.parentNode && modalWrap.parentNode.removeChild(modalWrap);
    }

    if(self.clonedEl) {
      document.getElementsByTagName('body')[0].appendChild(self.clonedEl);
      self.clonedEl.className += ' ' + 'open';

      self.closeFn = function(e) {
        window.location.hash = '';
        self.close(target);
        return false;
      };
      var closeEl = self.clonedEl.getElementsByClassName('close')[0];
      closeEl && PUBNUB.bind( 'click', closeEl, self.closeFn);

      var backDropEl = self.clonedEl.getElementsByClassName('modal-backdrop')[0];
      backDropEl && PUBNUB.bind( 'click', backDropEl, self.closeFn);

      if (fn) {
        fn.call(self.clonedEl);
      }

    }
  },
  close: function(target) {
    var self = this;
    self.clonedEl && self.clonedEl.parentNode && self.clonedEl.parentNode.removeChild(self.clonedEl);
  }
};


PUBNUB.bind('load', window, function() {

  (function() {
    // Cycle the homepage animation
    var hero = document.getElementById("home-animation");
    if (hero) {
      var heroParent = hero.parentNode;
      if (heroParent) {
        function resetHeroAnimation() {
          var new_hero = hero.cloneNode(true);
          heroParent.replaceChild(new_hero, hero);
          hero = new_hero;
          setTimeout(resetHeroAnimation, 30000);
        }
        setTimeout(resetHeroAnimation, 30000);
      }
    }
  }());

  (function(){

    var errors = {
            '401' : 'You must provide a valid Email!',
            '402' : 'You must provide an Email and Password!',
            '406' : 'You must provide a first and last name!',
            '407' : 'You must provide a company name!',
            '409' : 'Account Already Registered! <a href=/login>Login Now</a>'
        };

    var urlargs = {};

    var errors_from_uri = (location.search.split('?')[1]||'').split('&')||[];

    for (var error_index in errors_from_uri){
        var kv = errors_from_uri[error_index].split('=');
        urlargs[kv[0]]=kv[1]
    }

    var cookie_handler = {
            'get' : function(key) {
                try {
                    if (document.cookie.indexOf(key) == -1) return null;
                    return ((document.cookie||'').match(
                    RegExp(key+'=([^;]+)')
                    )||[])[1] || null;
                } catch(e) { return }
            },
            'set' : function( key, value ) {
                try {
                    var _cookie =  key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; domain=.'+location.host+'; path=/'
                    document.cookie = _cookie;
                } catch(e) { return }
            }
    };

    var pardot_cookie_id = 'visitor_id' + new String(parseInt(CONFIG['pardot_account_id']) - 1000).toString();
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "visitor_id";
    input.value = cookie_handler.get(pardot_cookie_id);

    var signup_fields = {
      'first-name' : '',
      'last-name' : '',
      'company' : '',
      'email-2' : ''
    };

    var loading = document.getElementById('loading');

    var get_started_after_render = function(extras) {
      var error_div = document.getElementById('error-codes');
      var sign_up_form = document.getElementById('sign-up-form-partial');
      try {
        var signup_fields_cookie = PUBNUB.db.get('signupfields');

        if (signup_fields_cookie) {
          signup_fields_cookie = JSON.parse(signup_fields_cookie);
          PUBNUB.each(signup_fields, function(key, value) {
            if (signup_fields_cookie && typeof signup_fields_cookie[key] !== 'undefined') {
              document.getElementById(key).value = signup_fields_cookie[key];
            }
          });
        }
      } catch (e) { }

      sign_up_form.appendChild(input);

      if (extras && extras.hasOwnProperty('tier') && extras.tier > 0) {
        if (document.getElementById('tier-input')) {
          document.getElementById('tier-input').value = extras.tier;
        } else {
          var tier_input = document.createElement("input");
          tier_input.type = "hidden";
          tier_input.name = "tier";
          tier_input.value = extras.tier;
          tier_input.id = "tier-input";
          sign_up_form.appendChild(tier_input);
        }
        document.getElementById('create_account_text').innerHTML = 'Create Tier ' + extras.tier + ' Account';
        document.getElementById('create_account_btn').value = 'Create Tier ' + extras.tier + ' Account';
      } else {
          document.getElementById('create_account_text').innerHTML = 'Create Free Account';
          document.getElementById('create_account_btn').value = 'Create Free Account';
      }

      if ('error' in urlargs) {

        error_div.innerHTML = errors[urlargs.error];
        error_div.style.display = 'block';

      }

      var submitted = 0;

      var submit = function() {

        if (submitted === 0) {
          loading.style.display = 'block';
          submitted = 1;
          PUBNUB.each(signup_fields, function(key, value) {
            signup_fields[key] = document.getElementById(key).value;
          });
          PUBNUB.db.set('signupfields', JSON.stringify(signup_fields));
          _gaq.push(['_trackEvent', 'signup', 'submit', 'get-started']);

          if (utm_source = PUBNUB.db.get('utm_source')) {
            document.getElementById('utm_source').value = utm_source;
          }

          if (utm_medium = PUBNUB.db.get('utm_medium')) {
            document.getElementById('utm_medium').value = utm_medium;
          }

          if (utm_content = PUBNUB.db.get('utm_content')) {
            document.getElementById('utm_content').value = utm_content;
          }

          if (utm_campaign = PUBNUB.db.get('utm_campaign')) {
            document.getElementById('utm_campaign').value = utm_campaign;
          }

          if (utm_keyword = PUBNUB.db.get('utm_keyword')) {
            document.getElementById('utm_keyword').value = utm_keyword;
          }

          setTimeout(function() {
            sign_up_form.submit();
          }, 100);

          return false;
        }

        return true;
      };

      PUBNUB.bind('submit', sign_up_form, submit);
    };

    var get_started_id = 'get-started';
    var promo_video_id = 'pubnub-promo-video';

    var modals = {};

    modals[get_started_id] = new Modal();
    modals[promo_video_id] = new Modal();

    if (window.location.pathname.indexOf(get_started_id) !== -1) {
        window.location.hash = '';
        get_started_after_render();
    } else if (window.location.hash === '#' + get_started_id){
      _gaq.push(['_trackPageview', '/get-started-lightbox']);
      modals[get_started_id].open(get_started_id, get_started_after_render);
    }

    // Modal button
    var modalEl = document.getElementsByClassName('btn-modal');

    for (var i = modalEl.length - 1; i >= 0; i--) {
      var next = document.getElementsByClassName('btn-modal')[i];
      next && PUBNUB.bind( 'click', next, function(e) {
        var target = ( e.target || e.srcElement );
        var tier = false;
        if (target.getAttribute('data-tier')) {
          tier = target.getAttribute('data-tier');
        }
        if (!target || !target.getAttribute('href')) {
          target = target.parentNode;
        }
        if (!target || !target.getAttribute('href')) {
          return location.href = '/' + get_started_id + '/';
        }
        target = target.getAttribute('href').split('#')[1];
        if (!(target in modals)) {
          modals[target] = new Modal();
        }
        if (target === get_started_id) {

          if (ie < 10) {
            return true;
          }

          _gaq.push(['_trackPageview', '/get-started-lightbox']);
          modals[target].open(target, function() {
            get_started_after_render({'tier':tier});
          });
        } else if (target === promo_video_id) {
          _gaq.push(['_trackPageview', '/pubnub-home-video']);
          modals[target].open(target, function() {
            var iframe = this.getElementsByTagName('iframe')[0];
            iframe.src = iframe.src.replace(/&autoplay=1/g, '') + '&autoplay=1';
          });
        } else {
          modals[target].open(target);
        }
      });
    }

  }());

});

(function() {

  var PUBNUB_alert = PUBNUB.init({
    subscribe_key: 'sub-c-726c7474-9540-11e3-9615-02ee2ddab7fe',
    ssl : (('https:' == document.location.protocol) ? true : false)
  });

  var PUBNUB_alert_channel = 'site_wide_alert';

  var PUBNUB_alert_processHistory = function(payload) {
    try {
      PUBNUB_alert_processMessage(payload[0][0]);
    } catch (e) { }
  };

  var PUBNUB_alert_processMessage = function(message) {
    try {
      if (typeof message !== 'undefined' && message.hasOwnProperty('enabled')) {
        var message_el = document.getElementById('alert_container');
        if (message['enabled'] === true && message.hasOwnProperty('alert')) {
          var message_alert = message['alert'].replace(/^\s+|\s+$/g,'');
          message_el.innerHTML = message_alert;
          message_el.className = message_el.className.replace('hidden', '');
        } else if (message['enabled'] === false) {
          message_el.innerHTML = '';
          message_el.className = message_el.className.replace('hidden', '') + ' hidden';
        }
      }
    } catch (e) { }
  };

  PUBNUB_alert.subscribe({
    channel : PUBNUB_alert_channel,
    message : PUBNUB_alert_processMessage
  });

  PUBNUB_alert.history({
    count : 1,
    channel : PUBNUB_alert_channel,
    callback : PUBNUB_alert_processHistory
  });
}());



  (function(window) {

    var hostname = 'https://admin-dev.pubnub.com';
    var env = 'dev';

    if (window.location.hostname === 'www.pubnub.com' || window.location.hostname === 'pubnub.com') {
        hostname = 'https://admin.pubnub.com';
        env = 'prod';
    } else if (window.location.hostname === 'website.localhost.com') {
        hostname = 'http://pn.localhost.com';
        env = 'local';
    }

    var pluses = /\+/g;
    var key = 'pn:admin:session';
    var decoded = function(s) {
      return decodeURIComponent(s.replace(pluses, ' '));
    };
    var getPNCookie = function() {
      var cookies = document.cookie.split('; ');
      for (var i = 0, l = cookies.length; i < l; i++) {
        var parts = cookies[i].split('=');
        if (decoded(parts.shift()) === key) {
          var cookie = decoded(parts.join('='));
          return JSON.parse(cookie);
        }
      }

    };

    var cookie_user = getPNCookie();

    var newerElement = function(ele, htmlclass, id, href){
      var element = document.createElement(ele);
      if(htmlclass){
          element.setAttribute('class', htmlclass);
      }
      if (id){
          element.setAttribute('id', id);
      }
      if (href){
        element.setAttribute('href', href);
      }
      return element
    }

    var updateMenuDom = function() {
      var user = JSON.parse(PUBNUB.db.get('pnuser'));
      var firstNameLastName = (user.first ? ' ' + user.first : '') + (user.last ? ' ' + user.last : '' );

      var li_welcome = newerElement("li", null, "loged-in");
      var welcome_dd = newerElement("div", "dropdown-link", "user-dropdown");
      var welcome_link = newerElement("a", null, null, hostname + '/#user/' + user.id);
      var color_span = newerElement('span', "branded");

      color_span.appendChild(document.createTextNode(firstNameLastName));
      welcome_link.innerHTML = '<i class="fa fa-user profile branded"></i>';
      welcome_link.appendChild(color_span);
      welcome_dd.appendChild(welcome_link);
      li_welcome.appendChild(welcome_dd);

      var register = PUBNUB.$('menu-register');
      var login = PUBNUB.$('menu-login');
      register.remove();
      login.parentNode.replaceChild(li_welcome, login);

      getAppsFromApi(user.token, user.id);

    };

    var updateMenuWithUser = function(response) {
      if (response && response.hasOwnProperty('result') && response.result.hasOwnProperty('user')) {
        var user = response.result.user;
        var ts = new Date();
        PUBNUB.db.set('pnuserts', ts.getDate());
        PUBNUB.db.set('pnuser', JSON.stringify({
          'email' : user.email,
          'id' : user.id,
          'first' : (user.properties ? user.properties.first : false),
          'last' : (user.properties ? user.properties.last : false),
          'token' : response.result.token
        }));
        updateMenuDom();
      }
      window.updateMenuWithUser = null;
      delete window.updateMenuWithUser;
    };

    var getUserFromAPI = function(token) {
      window.updateMenuWithUser = updateMenuWithUser;
      var s = document.createElement('script'); s.type = 'text/javascript';
      s.src = hostname + '/api/me?token='+token+'&callback=updateMenuWithUser';
      var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c);
    };

    var renderAppData = function(appData){
      var dropdown = document.getElementById('user-dropdown');
      var dropdownList = document.createElement('ul');
      dropdownList.setAttribute('class','dropdown-list animate')

      for (var idx in appData) {
        var res = appData[idx];
        var tempLi = document.createElement('li');
        var appElement = document.createElement('a');

        appElement.innerHTML = '<i class="fa fa-cog"></i><span>'+res.name+'</span>';
        appElement.setAttribute('href', hostname + '/#user/' + res.owner_id + '/app/' + res.id + '/usage');
        tempLi.appendChild(appElement);
        dropdownList.appendChild(tempLi);
      }
      dropdown.appendChild(dropdownList);
    };

    var getAppData = function(response) {
      if (response && response.hasOwnProperty('result')) {
        var apps = response.result;
        for (var appIndex in apps) {
          //Loop through each app to inspect keys
          var shouldRemoveApp = true;
          if (apps[appIndex].hasOwnProperty('keys')) {
            //Loop through all keys of an app to determine if any are enabled
            for (var keyIndex in apps[appIndex].keys) {
              if (apps[appIndex].keys[keyIndex].hasOwnProperty('status') && apps[appIndex].keys[keyIndex].status == 1) {
                //Atleast 1 key in the app is enabled, lets not remove it
                shouldRemoveApp = false;
                break;
              }
            }
          }
          if (shouldRemoveApp) {
            apps.splice(appIndex,1);
          }
        }
        var ts = new Date();
        PUBNUB.db.set('pnappsts', ts.getDate());
        PUBNUB.db.set('pnapps', JSON.stringify(
          apps
        ));
        renderAppData(apps);
      }
      window.getAppData = null;
      delete window.getAppData;
    };

    var getAppsFromApi = function(token,id) {
      var testpnapps = PUBNUB.db.get('pnapps');
      if ( new Date().getDate() !== PUBNUB.db.get('pnappsts')){
        testpnapps = false;
        PUBNUB.db.set('pnapps',false);
      }
      if (testpnapps && JSON.parse(testpnapps)) {
        renderAppData(JSON.parse(testpnapps) );
      } else {
        window.getAppData = getAppData;
        var s = document.createElement('script'); s.type = 'text/javascript';
        s.src = hostname + '/api/apps?owner_id='+id+'&token='+token+'&callback=getAppData';
        var c = document.getElementsByTagName('script')[0]; c.parentNode.insertBefore(s, c);
      }
    };

    if (cookie_user && cookie_user.user_id) {
      var testpnuser = PUBNUB.db.get('pnuser');
      if ( new Date().getDate() !== PUBNUB.db.get('pnuserts')){
        testpnuser = false;
        PUBNUB.db.set('pnuser',false);
      }
      if (testpnuser && JSON.parse(testpnuser)) {
        updateMenuDom();
      } else {
        getUserFromAPI(cookie_user.token);
      }
    } else {
      PUBNUB.db.set('pnuser',false);
    }


  }(window));
