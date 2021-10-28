const { GObject} = imports.gi;
const UPower = imports.gi.UPowerGlib;
const BaseIndicator = imports.ui.status.power.Indicator;
const ExtensionUtils = imports.misc.extensionUtils
const Main = imports.ui.main

// Thanks autohide-battery@sitnik.ru
function getBattery(callback) {
   let menu = Main.panel.statusArea.aggregateMenu
   if (menu && menu._power) {
     callback(menu._power._proxy, menu._power)
   }
 }

var Indicator = GObject.registerClass(
   class Indicator extends BaseIndicator {
   // Adapted from _getStatus of the parent.
   _getTime() {
      try {
         let settings, threshold;
         try {
            settings = ExtensionUtils.getSettings('lakeland.battery-clock');
            threshold = settings.get_int("charge-threshold") || 100;
         } catch {}
         
         if(!threshold || threshold == 0){
            if(settings != null && threshold == 0)
               settings.set_int("charge-threshold", 100)
            threshold = 100;
         }

         let seconds = 0;

         // This returns fractional outputs on dual battery laptops, rounding is a quick solution
         const percentage = Math.round(this._proxy.Percentage);

         // Ensure percentage label is enabled regardless of gsettings
         this._percentageLabel.visible = true;

         // Thanks autohide-battery@sitnik.ru
         if(settings != null && settings.get_bool("hide-icon") && percentage >= threshold && (this._proxy.State === UPower.DeviceState.FULLY_CHARGED || this._proxy.State === UPower.DeviceState.CHARGING))
         {
            getBattery((proxy, icon) => {
               icon.hide()
             })
             return '';
         } else {
            getBattery((proxy, icon) => {
               icon.show()
             })
         }

         if (this._proxy.State === UPower.DeviceState.FULLY_CHARGED || percentage >= threshold) {
            return '\u221E';
         } else if (this._proxy.State === UPower.DeviceState.CHARGING) {
            seconds = this._proxy.TimeToFull * (threshold/100);
         } else if (this._proxy.State === UPower.DeviceState.DISCHARGING) {
            seconds = this._proxy.TimeToEmpty;
         }

         let time = Math.round(seconds / 60);
         if (time === 0) {
            // 0 is reported when UPower does not have enough data
            // to estimate battery life
            return _("… (%s)").format(percentage);
         }
         let output = '';

         if(time >= 60) {
            let curTime = new Date();
            let emptyTime = new Date(curTime.getTime() + (seconds*1000));
   
            let emptyHours = emptyTime.getHours();
            let emptyMins = emptyTime.getMinutes();

            let timeDisplay = emptyHours % 12 == 0 && 12 || emptyHours % 12;
            let amBool = (emptyHours % 12 == emptyHours || emptyHours / 12 == 2);

            // Translators: this is <hours>:<minutes> AM/PM (Battery%)
            output = _('%d\u2236%02d %s (%s%%)').format(timeDisplay, emptyMins, (amBool && "AM" || "PM"), percentage);
         } else {
            output = _('%d mins (%s%%)').format(time, percentage);
         }
         // Clean-up objects to prevent a memory leak, don't know if this is required or not
         // curTime = null;
         // emptyTime = null;

         return output;
      } catch (e) {
         logError(e, 'ExtensionError');
      }
   }

   _sync() {
      super._sync();
      this._percentageLabel.text = this._getTime();
   }
});
