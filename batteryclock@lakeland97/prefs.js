const ExtensionUtils = imports.misc.extensionUtils
const Gtk = imports.gi.Gtk

let _ = 'Battery Clock'

function init(){
  
}

function buildPrefsWidget() {
  let settings = ExtensionUtils.getSettings('lakeland.battery-clock')

  let grid = new Gtk.Grid({
    margin_top: 24,
    margin_bottom: 24,
    margin_start: 24,
    margin_end: 24,
    column_spacing: 24,
    row_spacing: 12,
    halign: Gtk.Align.CENTER
  })

  let label = new Gtk.Label({
    label: _('Battery theshold'),
    halign: Gtk.Align.START
  })
  grid.attach(label, 0, 0, 1, 1)

  let field = new Gtk.SpinButton()
  field.set_range(0, 100)
  field.set_sensitive(true)
  field.set_increments(1, 10)
  grid.attach(field, 1, 0, 1, 1)

  let note = new Gtk.Label({
    label: _('If you want to charge to less than 100%'),
    halign: Gtk.Align.CENTER
  })
  note.get_style_context().add_class('dim-label')
  grid.attach(note, 0, 1, 2, 1)

  field.set_value(settings.get_int('charge-theshold'))
  field.connect('value-changed', widget => {
    settings.set_int('charge-theshold', widget.get_value_as_int())
  })
  settings.connect('changed::charge-theshold', () => {
    field.set_value(settings.get_int('charge-theshold'))
  })
  return grid
}
