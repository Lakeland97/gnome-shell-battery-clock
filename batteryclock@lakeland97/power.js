const { GObject} = imports.gi;
const UPower = imports.gi.UPowerGlib;
const BaseIndicator = imports.ui.status.power.Indicator;

var Indicator = GObject.registerClass(
   class Indicator extends BaseIndicator {
   // Adapted from _getStatus of the parent.
   _getTime() {
      try {
         let seconds = 0;

         // This returns fractional outputs on dual battery laptops, rounding is a quick solution
         const percentage = Math.round(this._proxy.Percentage) + '%';

         // Ensure percentage label is enabled regardless of gsettings
         this._percentageLabel.visible = true;

         if (this._proxy.State === UPower.DeviceState.FULLY_CHARGED) {
            return '';
         } else if (this._proxy.State === UPower.DeviceState.CHARGING) {
            seconds = this._proxy.TimeToFull;
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

         let curTime = new Date();
         let emptyTime = new Date(curTime.getTime() + (seconds*1000));

         let emptyHours = emptyTime.getHours();
         let emptyMins = emptyTime.getMinutes();

         if(time >= 3600) {
            // Translators: this is <hours>:<minutes>
            output = _('%d\u2236%02d %s (%s)').format(emptyHours % 12, emptyMins, (emptyHours % 12 == emptyHours && "AM" || "PM"), percentage);
         } else {
            output = _('%d mins (%s)').format(time, percentage);
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
