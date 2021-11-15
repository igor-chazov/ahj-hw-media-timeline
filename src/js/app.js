import Timeline from './timeline/Timeline';
import TimelineController from './TimelineController';

const timeline = new Timeline(document.querySelector('.timeline'));
timeline.init();
const timelineCtrl = new TimelineController(document.querySelector('.timeline'));
timelineCtrl.init();
