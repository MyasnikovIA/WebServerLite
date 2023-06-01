package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class cmpTime extends Base {
    /*

<cmpDatetime label="Время" name="dat" value="10.05.2023 10:20" width="160"/>

    https://snipp.ru/jquery/time-ui-datepicker
    https://trentrichardson.com/examples/timepicker/
    https://github.com/trentrichardson/jQuery-Timepicker-Addon


        <cmpDatetime name="userName4" label="--editxcvbxcvbxcvbxcvbxcvbcxv2--"  width="500"/>

    Options
    The timepicker does inherit all options from datepicker. However, there are many options that are shared by them both, and many timepicker only options:

    Localization Options
    currentText
    Default: "Now", A Localization Setting - Text for the Now button.
    closeText
    Default: "Done", A Localization Setting - Text for the Close button.
    amNames
    Default: ['AM', 'A'], A Localization Setting - Array of strings to try and parse against to determine AM.
    pmNames
    Default: ['PM', 'P'], A Localization Setting - Array of strings to try and parse against to determine PM.
    timeFormat
    Default: "HH:mm", A Localization Setting - String of format tokens to be replaced with the time. See Formatting.
    timeSuffix
    Default: "", A Localization Setting - String to place after the formatted time.
    timeOnlyTitle
    Default: "Choose Time", A Localization Setting - Title of the wigit when using only timepicker.
    timeText
    Default: "Time", A Localization Setting - Label used within timepicker for the formatted time.
    hourText
    Default: "Hour", A Localization Setting - Label used to identify the hour slider.
    minuteText
    Default: "Minute", A Localization Setting - Label used to identify the minute slider.
    secondText
    Default: "Second", A Localization Setting - Label used to identify the second slider.
    millisecText
    Default: "Millisecond", A Localization Setting - Label used to identify the millisecond slider.
    microsecText
    Default: "Microsecond", A Localization Setting - Label used to identify the microsecond slider.
    timezoneText
    Default: "Timezone", A Localization Setting - Label used to identify the timezone slider.
    isRTL
    Default: false, A Localization Setting - Right to Left support.
    Alt Field Options
    altFieldTimeOnly
    Default: true - When altField is used from datepicker altField will only receive the formatted time and the original field only receives date.
    altSeparator
    Default: (separator option) - String placed between formatted date and formatted time in the altField.
    altTimeSuffix
    Default: (timeSuffix option) - String always placed after the formatted time in the altField.
    altTimeFormat
    Default: (timeFormat option) - The time format to use with the altField.
    altRedirectFocus
    Default: true - Whether to immediately focus the main field whenever the altField receives focus. Effective at construction time only, changing it later has no effect.
    Timezone Options
    timezoneList
    Default: [generated timezones] - An array of timezones used to populate the timezone select. Can be an array of values or an array of objects: { label: "EDT", value: -240 }. The value should be the offset number in minutes. So "-0400" which is the format "-hhmm", would equate to -240 minutes.
    Time Field Options
    controlType
    Default: 'slider' - Whether to use 'slider' or 'select'. If 'slider' is unavailable through jQueryUI, 'select' will be used. For advanced usage you may pass an object which implements "create", "options", "value" methods to use controls other than sliders or selects. See the _controls property in the source code for more details.
    {
        create: function(tp_inst, obj, unit, val, min, max, step){
            // generate whatever controls you want here, just return obj
        },
        options: function(tp_inst, obj, unit, opts, val){
            // if val==undefined return the value, else return obj
        },
        value: function(tp_inst, obj, unit, val){
            // if val==undefined return the value, else return obj
        }
    }
    showHour
    Default: null - Whether to show the hour control. The default of null will use detection from timeFormat.
    showMinute
    Default: null - Whether to show the minute control. The default of null will use detection from timeFormat.
    showSecond
    Default: null - Whether to show the second control. The default of null will use detection from timeFormat.
    showMillisec
    Default: null - Whether to show the millisecond control. The default of null will use detection from timeFormat.
    showMicrosec
    Default: null - Whether to show the microsecond control. The default of null will use detection from timeFormat.
    showTimezone
    Default: null - Whether to show the timezone select.
    showTime
    Default: true - Whether to show the time selected within the datetimepicker.
    stepHour
    Default: 1 - Hours per step the slider makes.
    stepMinute
    Default: 1 - Minutes per step the slider makes.
    stepSecond
    Default: 1 - Seconds per step the slider makes.
    stepMillisec
    Default: 1 - Milliseconds per step the slider makes.
    stepMicrosec
    Default: 1 - Microseconds per step the slider makes.
    hour
    Default: 0 - Initial hour set.
    minute
    Default: 0 - Initial minute set.
    second
    Default: 0 - Initial second set.
    millisec
    Default: 0 - Initial millisecond set.
    microsec
    Default: 0 - Initial microsecond set. Note: Javascript's native Date object does not natively support microseconds. Timepicker adds ability to simply Date.setMicroseconds(m) and Date.getMicroseconds(). Date comparisons will not acknowledge microseconds. Use this only for display purposes.
    timezone
    Default: null - Initial timezone set. This is the offset in minutes. If null the browser's local timezone will be used. If you're timezone is "-0400" you would use -240. For backwards compatibility you may pass "-0400", however the timezone is stored in minutes and more reliable.
    hourMin
    Default: 0 - The minimum hour allowed for all dates.
    minuteMin
    Default: 0 - The minimum minute allowed for all dates.
    secondMin
    Default: 0 - The minimum second allowed for all dates.
    millisecMin
    Default: 0 - The minimum millisecond allowed for all dates.
    microsecMin
    Default: 0 - The minimum microsecond allowed for all dates.
    hourMax
    Default: 23 - The maximum hour allowed for all dates.
    minuteMax
    Default: 59 - The maximum minute allowed for all dates.
    secondMax
    Default: 59 - The maximum second allowed for all dates.
    millisecMax
    Default: 999 - The maximum millisecond allowed for all dates.
    microsecMax
    Default: 999 - The maximum microsecond allowed for all dates.
    hourGrid
    Default: 0 - When greater than 0 a label grid will be generated under the slider. This number represents the units (in hours) between labels.
    minuteGrid
    Default: 0 - When greater than 0 a label grid will be generated under the slider. This number represents the units (in minutes) between labels.
    secondGrid
    Default: 0 - When greater than 0 a label grid will be genereated under the slider. This number represents the units (in seconds) between labels.
    millisecGrid
    Default: 0 - When greater than 0 a label grid will be genereated under the slider. This number represents the units (in milliseconds) between labels.
    microsecGrid
    Default: 0 - When greater than 0 a label grid will be genereated under the slider. This number represents the units (in microseconds) between labels.
    Other Options
    showButtonPanel
    Default: true - Whether to show the button panel at the bottom. This is generally needed.
    timeInput
    Default: false - Allows direct input in time field
    timeOnly
    Default: false - Hide the datepicker and only provide a time interface.
    timeOnlyShowDate
    Default: false - Show the date and time in the input, but only allow the timepicker.
    afterInject
    Default: null - Function to be called when the timepicker or selection control is injected or re-rendered. Called in the context of the timepicker instance.
    onSelect
    Default: null - Function to be called when a date is chosen or time has changed (parameters: datetimeText, datepickerInstance).
    alwaysSetTime
    Default: true - Always have a time set internally, even before user has chosen one.
    separator
    Default: " " - When formatting the time this string is placed between the formatted date and formatted time.
    pickerTimeFormat
    Default: (timeFormat option) - How to format the time displayed within the timepicker.
    pickerTimeSuffix
    Default: (timeSuffix option) - String to place after the formatted time within the timepicker.
    showTimepicker
    Default: true - Whether to show the timepicker within the datepicker.
    oneLine
    Default: false - Try to show the time dropdowns all on one line. This should be used with controlType 'select' and as few units as possible.
    addSliderAccess
    Default: false - Adds the sliderAccess plugin to sliders within timepicker
    sliderAccessArgs
    Default: null - Object to pass to sliderAccess when used.
    defaultValue
    Default: null - String of the default time value placed in the input on focus when the input is empty.
    minDateTime
    Default: null - Date object of the minimum datetime allowed. Also available as minDate.
    maxDateTime
    Default: null - Date object of the maximum datetime allowed. Also Available as maxDate.
    minTime
    Default: null - String of the minimum time allowed. '8:00 am' will restrict to times after 8am
    maxTime
    Default: null - String of the maximum time allowed. '8:00 pm' will restrict to times before 8pm
    parse
    Default: 'strict' - How to parse the time string. Two methods are provided: 'strict' which must match the timeFormat exactly, and 'loose' which uses javascript's new Date(timeString) to guess the time. You may also pass in a function(timeFormat, timeString, options) to handle the parsing yourself, returning a simple object:
    {
        hour: 19,
        minute: 10,
        second: 23,
        millisec: 45,
        microsec: 23,
        timezone: '-0400'
    }

    */
    public cmpTime(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        if (doc.select("[cmp=\"cmpMask\"]").toString().length() == 0) {
            // Добавляем библиотеку для маски
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/jquery.maskedinput.min.js\" type=\"text/javascript\"/>");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/tel_filtr.js\" type=\"text/javascript\"/>");
            elements.append("<link href=\"/System/jqueryui/Addon/TimePicker/dist/jquery-ui-timepicker-addon.min.css\" rel=\"stylesheet\" type=\"text/css\"/>");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/TimePicker/dist/jquery-ui-timepicker-addon.min.js\" type=\"text/javascript\"/>");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/TimePicker/dist/date_time_filtr.js\" type=\"text/javascript\"/>");
        }
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        String width = getCssArrKeyRemuve(attrs, "width", false);
        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        attrsDst.add("schema", "timepicker");
        attrsDst.add("type", "timepicker");
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" $('[name=\"" + ctrlName + "\"]').timepicker();\n");
        sb.append(" $('[name=\"" + ctrlName + "\"]').mask(\"99:99\")\n");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append(getJQueryEventString(ctrlName, attrs, true));
        if (attrs.hasKey("value")) {
            sb.append(" $('[name=\"" + ctrlName + "\"]').timepicker('setTime','" + RemoveArrKeyRtrn(attrs, "value") + "');\n");
        }
        sb.append("}); </script>");
        this.append(sb.toString());
        this.append("<label block=\"label\" for=\"" + ctrlName + "\">" + RemoveArrKeyRtrn(attrs, "label", "") + "</label>\n");
        String placeholder = RemoveArrKeyRtrn(attrs, "placeholder");
        this.append("<input  name=\"" + ctrlName + "\"" + " style=\"position: relative;" + width + ";\"  placeholder=\"" + placeholder + "\"/>");
    }
}
