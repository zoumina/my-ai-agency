export class EmergencyStop {
 private stopped=false;
 activate(){this.stopped=true}
 release(){this.stopped=false}
 isActive(){return this.stopped}
 assertRunning(){if(this.stopped)throw new Error("Emergency stop is active.");}
}