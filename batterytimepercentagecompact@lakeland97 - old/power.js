const { GObject} = imports.gi;
const UPower = imports.gi.UPowerGlib;
const BaseIndicator = imports.ui.status.power.Indicator;

var Indicator = GObject.registerClass(
   class Indicator extends BaseIndicator {
   // Adapted from _getStatus of the parent.
   _getTime() {
      let seconds = 0;

      // This returns fractional outputs on dual battery laptops, rounding is a quick solution
      const percentage = Math.round(this._proxy.Percentage) + '%'

      // Ensure percentage label is enabled regardless of gsettings
      this._percentageLabel.visible = true

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

      // let minutes = time % 60;
      // let hours = Math.floor(time / 60);

      let emptytime = new Date(new Date().getTime() + (seconds*1000));

      let hrs = emptytime.getHours();
      let mins = emptytime.getMinutes();
      let ampm = (hrs % 12 == hrs && "AM" || "PM");

      // Translators: this is <hours>:<minutes>
      return _('%d\u2236%02d %s (%s)').format(hrs % 12, mins, ampm, percentage);
   }

   _sync() {
      super._sync();
      this._percentageLabel.text = this._getTime();
   }
});
