function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new r(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,_=g.trustedTypes,f=_?_.emptyScript:"",m=g.reactiveElementPolyfillSupport,b=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),v={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const r=s?.call(this);o?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const r=o.fromAttribute(e,t.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const r=this.constructor;if(!1===s&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??y)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==o||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,m?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,w=t=>t,E=A.trustedTypes,S=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+k,U=`<${P}>`,T=document,O=()=>T.createComment(""),H=t=>null===t||"object"!=typeof t&&"function"!=typeof t,M=Array.isArray,R="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,L=/>/g,j=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,D=/"/g,B=/^(?:script|style|textarea|title)$/i,W=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),q=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),G=new WeakMap,Z=T.createTreeWalker(T,129);function J(t,e){if(!M(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":3===e?"<math>":"",n=N;for(let e=0;e<i;e++){const i=t[e];let a,l,h=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===N?"!--"===l[1]?n=I:void 0!==l[1]?n=L:void 0!==l[2]?(B.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=j):void 0!==l[3]&&(n=j):n===j?">"===l[0]?(n=o??N,h=-1):void 0===l[1]?h=-2:(h=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?j:'"'===l[3]?D:z):n===D||n===z?n=j:n===I||n===L?n=N:(n=j,o=void 0);const d=n===j&&t[e+1].startsWith("/>")?" ":"";r+=n===N?i+U:h>=0?(s.push(a),i.slice(0,h)+C+i.slice(h)+k+d):i+k+(-2===h?e:d)}return[J(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class F{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,h]=K(t,e);if(this.el=F.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=h[r++],i=s.getAttribute(t).split(k),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(k)&&(a.push({type:6,index:o}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(k),e=t.length-1;if(e>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),Z.nextNode(),a.push({type:2,index:++o});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===P)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(k,t+1));)a.push({type:7,index:o}),t+=k.length-1}o++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function X(t,e,i=t,s){if(e===q)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const r=H(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),void 0===r?o=void 0:(o=new r(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=X(t,o._$AS(t,e.values),o,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??T).importNode(e,!0);Z.currentNode=s;let o=Z.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new Y(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new ot(o,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(o=Z.nextNode(),r++)}return Z.currentNode=T,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),H(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>M(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=F.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new F(t)),e}k(t){M(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new Y(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=V}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=X(this,t,e,0),r=!H(t)||t!==this._$AH&&t!==q,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=X(this,s[i+n],e,n),a===q&&(a=this._$AH[n]),r||=!H(a)||a!==this._$AH[n],a===V?t=V:t!==V&&(t+=(a??"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class st extends tt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??V)===q)return;const i=this._$AH,s=t===V&&i!==V||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==V&&(i===V||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const rt=A.litHtmlPolyfillSupport;rt?.(F,Y),(A.litHtmlVersions??=[]).push("3.3.2");const nt=globalThis;class at extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new Y(e.insertBefore(O(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const ht={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:y},ct=(t=ht,e,i)=>{const{kind:s,metadata:o}=i;let r=globalThis.litPropertyMetadata.get(o);if(void 0===r&&globalThis.litPropertyMetadata.set(o,r=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function dt(t){return(e,i)=>"object"==typeof i?ct(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function pt(t){return dt({...t,state:!0,attribute:!1})}class ut extends at{setConfig(t){this._config=t}_titleChanged(t){if(!this._config)return;const e=t.target.value;this._config={...this._config,title:e||void 0},this._fireChanged()}_mediaIdChanged(t){if(!this._config)return;const e=t.target.value.trim();this._config={...this._config,media_content_id:e||void 0},this._fireChanged()}_fireChanged(){const t=new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0});this.dispatchEvent(t)}render(){return this._config?W`
      <div class="card-config">
        <ha-textfield
          .label=${"Title"}
          .value=${this._config.title??""}
          .placeholder=${"Gallery"}
          @input=${this._titleChanged}
        ></ha-textfield>
        <ha-textfield
          .label=${"Start folder (Media Source ID)"}
          .value=${this._config.media_content_id??""}
          .placeholder=${"media-source://media_source/local"}
          .helper=${"Leave empty to open the media browser root. Put images under the path set in configuration.yaml → homeassistant → media_dirs."}
          helperPersistent
          @input=${this._mediaIdChanged}
        ></ha-textfield>
      </div>
    `:W``}}function gt(t){if(!t.can_play||!t.media_content_type)return!1;return t.media_content_type.toLowerCase().split(";")[0].trim().startsWith("image/")}function _t(t){return!!t.can_expand&&!gt(t)}ut.styles=n`
    .card-config ha-textfield {
      display: block;
      margin-bottom: 16px;
    }
  `,t([dt({attribute:!1})],ut.prototype,"hass",void 0),t([pt()],ut.prototype,"_config",void 0),customElements.get("ha-gallery-editor")||customElements.define("ha-gallery-editor",ut),window.customCards=window.customCards||[],window.customCards.some(t=>"custom:ha-gallery"===t.type)||window.customCards.push({type:"custom:ha-gallery",name:"HA Gallery",description:"Gallery frontend for Home Assistant"});class ft extends at{constructor(){super(...arguments),this._currentItem=null,this._breadcrumb=[],this._loading=!1,this._error=null,this._lightboxUrl=null,this._lightboxTitle=null}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config=t}updated(t){if(super.updated(t),this._config){if(t.has("hass")){const e=t.get("hass");!e?.connection&&this.hass?.connection&&this._loadRoot()}if(t.has("_config")&&this.hass?.connection){const e=t.get("_config");e?.media_content_id!==this._config?.media_content_id&&this._loadRoot()}}}_initialBrowseId(){return(this._config?.media_content_id??"").trim()}async _loadRoot(){await this._browse(this._initialBrowseId())}async _browse(t){if(this.hass?.connection){this._loading=!0,this._error=null;try{const e=await this.hass.callWS({type:"media_source/browse_media",media_content_id:t||""});this._currentItem=e,t||(this._breadcrumb=[])}catch(t){this._error=t instanceof Error?t.message:String(t),this._currentItem=null}finally{this._loading=!1}}}_navigateTo(t){if(t.can_expand&&t.children)return this._currentItem=t,void(this._breadcrumb=[...this._breadcrumb,{id:t.media_content_id,title:t.title}]);t.can_expand&&!t.children&&(this._browse(t.media_content_id),this._breadcrumb=[...this._breadcrumb,{id:t.media_content_id,title:t.title}])}_breadcrumbClick(t){if(t<0)return this._breadcrumb=[],void this._loadRoot();const e=this._breadcrumb[t].id;this._breadcrumb=this._breadcrumb.slice(0,t+1),this._browse(e)}_imageUrl(t){return function(t,e){const i=`/media/${t.startsWith("media-source://")?t.replace(/^media-source:\/\/[^/]+\//,""):t}`;return e?`${e}${i}`:i}(t.media_content_id)}_openLightbox(t,e){this._lightboxUrl=t,this._lightboxTitle=e}_closeLightbox(){this._lightboxUrl=null,this._lightboxTitle=null}_downloadImage(t,e,i){i.preventDefault(),i.stopPropagation();const s=document.createElement("a");s.href=t,s.download=e||"image",s.target="_blank",s.rel="noopener",document.body.appendChild(s),s.click(),document.body.removeChild(s)}getCardSize(){return 4}static getStubConfig(){return{type:"custom:ha-gallery",title:"Gallery"}}static getConfigElement(){return document.createElement("ha-gallery-editor")}render(){if(!this._config)return V;const t=this._config.title??"Gallery",e=this._currentItem?.children?.filter(_t)??[],i=this._currentItem?.children?.filter(gt)??[];return W`
      <ha-card class="card">
        <div class="header">${t}</div>

        ${this._breadcrumb.length?W`
              <div class="breadcrumb">
                <button type="button" @click=${()=>this._breadcrumbClick(-1)}>
                  Home
                </button>
                ${this._breadcrumb.map((t,e)=>W`
                    <span class="sep">/</span>
                    <button type="button" @click=${()=>this._breadcrumbClick(e)}>
                      ${t.title}
                    </button>
                  `)}
              </div>
            `:""}

        <div class="content">
          ${this._loading?W`<div class="loading">Loading…</div>`:this._error?W`<div class="error">${this._error}</div>`:W`
                  ${e.length?W`
                        <div class="folders">
                          ${e.map(t=>W`
                              <div
                                class="folder-card"
                                role="button"
                                tabindex="0"
                                @click=${()=>this._navigateTo(t)}
                                @keydown=${e=>("Enter"===e.key||" "===e.key)&&this._navigateTo(t)}
                              >
                                <ha-icon icon="mdi:folder"></ha-icon>
                                <span>${t.title}</span>
                              </div>
                            `)}
                        </div>
                      `:""}
                  ${i.length?W`
                        <div class="images">
                          ${i.map(t=>W`
                              <div class="image-wrap">
                                <img
                                  src=${this._imageUrl(t)}
                                  alt=${t.title}
                                  loading="lazy"
                                  @click=${()=>this._openLightbox(this._imageUrl(t),t.title)}
                                />
                                <div class="actions">
                                  <button
                                    type="button"
                                    @click=${e=>this._openLightbox(this._imageUrl(t),t.title)}
                                  >
                                    <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
                                    Zoom
                                  </button>
                                  <button
                                    type="button"
                                    @click=${e=>this._downloadImage(this._imageUrl(t),t.title,e)}
                                  >
                                    <ha-icon icon="mdi:download"></ha-icon>
                                    Download
                                  </button>
                                </div>
                              </div>
                            `)}
                        </div>
                      `:""}
                  ${this._loading||this._error||!this._currentItem||e.length||i.length?"":W`<div class="loading">No images in this folder.</div>`}
                `}
        </div>
      </ha-card>

      ${this._lightboxUrl?W`
            <div
              class="lightbox"
              role="button"
              tabindex="0"
              @click=${this._closeLightbox}
              @keydown=${t=>"Escape"===t.key&&this._closeLightbox()}
            >
              <button
                type="button"
                class="lightbox-close"
                aria-label="Close"
                @click=${t=>{t.stopPropagation(),this._closeLightbox()}}
              >
                ×
              </button>
              <img
                class="lightbox-content"
                src=${this._lightboxUrl}
                alt=${this._lightboxTitle??""}
                loading="eager"
              />
              ${this._lightboxTitle?W`<span class="lightbox-title">${this._lightboxTitle}</span>`:""}
            </div>
          `:""}
    `}}ft.styles=n`
    :host {
      display: block;
      padding: 0;
    }
    .card {
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      overflow: hidden;
    }
    .header {
      padding: 12px 16px;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: var(--secondary-background-color, #f5f5f5);
      font-size: 0.875rem;
      color: var(--secondary-text-color);
    }
    .breadcrumb button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--primary-color, #03a9f4);
    }
    .breadcrumb button:hover {
      background: var(--primary-color);
      color: var(--card-background-color, white);
    }
    .breadcrumb .sep {
      opacity: 0.6;
    }
    .content {
      padding: 16px;
      min-height: 120px;
    }
    .folders {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .folder-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.2s, border-color 0.2s;
    }
    .folder-card:hover {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .folder-card ha-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      --mdc-icon-size: 48px;
    }
    .folder-card span {
      text-align: center;
      word-break: break-word;
      font-size: 0.875rem;
    }
    .images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
    .image-wrap {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: var(--secondary-background-color, #eee);
      aspect-ratio: 1;
    }
    .image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .image-wrap .actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      opacity: 0;
      transition: opacity 0.2s;
    }
    .image-wrap:hover .actions {
      opacity: 1;
    }
    .image-wrap .actions button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .image-wrap .actions button:hover {
      background: #fff;
    }
    .loading,
    .error {
      text-align: center;
      padding: 24px;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color, #b00020);
    }
    /* Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .lightbox .lightbox-content {
      max-width: 95vw;
      max-height: 90vh;
      object-fit: contain;
      pointer-events: none;
    }
    .lightbox .lightbox-title {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 0.875rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
    .lightbox .lightbox-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `,t([dt({attribute:!1})],ft.prototype,"hass",void 0),t([pt()],ft.prototype,"_config",void 0),t([pt()],ft.prototype,"_currentItem",void 0),t([pt()],ft.prototype,"_breadcrumb",void 0),t([pt()],ft.prototype,"_loading",void 0),t([pt()],ft.prototype,"_error",void 0),t([pt()],ft.prototype,"_lightboxUrl",void 0),t([pt()],ft.prototype,"_lightboxTitle",void 0),customElements.get("ha-gallery")||customElements.define("ha-gallery",ft);export{ft as HaGallery};
