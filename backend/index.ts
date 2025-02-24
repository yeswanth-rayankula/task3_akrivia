const moment=require( "moment");

interface Time {
  hours: number;
  minutes: number;
  seconds: number;
  meridian?: "AM" | "PM";
}

function calculateExitTime(initialTime: Time, workHours: Time, breaks: Time[]): Time {
  let startTime = moment(`${initialTime.hours}:${initialTime.minutes}:${initialTime.seconds} ${initialTime.meridian}`, "h:mm:ss A");

  // Add work hours
  startTime.add({ hours:workHours.hours,  minutes:workHours.minutes,  seconds:workHours.seconds});

  // Add breaks
  breaks.forEach(b => {
    startTime.add({ hours:b.hours, minutes:b.minutes, seconds:b.seconds});
  });

  return {
    hours: startTime.hours() % 12 || 12,
    minutes: startTime.minutes(),
    seconds: startTime.seconds(),
    meridian: startTime.hours() >= 12 ? "PM" : "AM"
  };
}

let initialTime: Time = { hours: 10, minutes: 59, seconds: 59, meridian: "AM" };
let workHours: Time = { hours: 8, minutes: 0, seconds: 0 };
let breaks: Time[] = [
  { hours: 0, minutes: 0, seconds: 59 }
];

let exitTime = calculateExitTime(initialTime, workHours, breaks);
console.log(`${exitTime.hours}:${exitTime.minutes}:${exitTime.seconds} ${exitTime.meridian}`);
