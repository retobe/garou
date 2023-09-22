const User = require("../schemas/user");
module.exports = class Utils {
  /**
   * Checks if a string contains a URL
   * @param {string} text
   */
  static containsLink(text) {
    return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
      text
    );
  }

  /**
   * Checks if a string is a valid discord invite
   * @param {string} text
   */
  static containsDiscordInvite(text) {
    return /(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?p?p?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/.test(
      text
    );
  }

  /**
   * Returns a random number below a max
   * @param {number} max
   */
  static getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  /**
   * Returns shuffeld array with the shuffled piece
   * @param {Array} text
   * @param {number} max
   */
  static shuffleArray(array, shuffled) {
    let shuffledArray = array.sort((a, b) => 0.5 - Math.random());
    if (!shuffled) {
      shuffled = 0;
    }
    return shuffledArray[shuffled];
  }

  /**
   * Rounds to the nearest decimal
   * @param {number} value
   * @param {number} precision
   */
  static round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Checks if a string is a valid Hex color
   * @param {string} text
   */
  static isHex(text) {
    return /^#[0-9A-F]{6}$/i.test(text);
  }

  /**
   * Returns hour difference between two dates
   * @param {Date} dt2
   * @param {Date} dt1
   */
  static diffHours(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60;
    return Math.abs(Math.round(diff));
  }

  /**
   * Returns remaining time in days, hours, minutes and seconds
   * @param {number} timeInSeconds
   */
  static timeformat(timeInSeconds) {
    const days = Math.floor((timeInSeconds % 31536000) / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);
    return (
      (days > 0 ? `${days} days, ` : "") +
      (hours > 0 ? `${hours} hours, ` : "") +
      (minutes > 0 ? `${minutes} minutes, ` : "") +
      (seconds > 0 ? `${seconds} seconds` : "")
    );
  }

  /**
   * Converts duration to milliseconds
   * @param {string} duration
   */
  static durationToMillis(duration) {
    return (
      duration
        .split(":")
        .map(Number)
        .reduce((acc, curr) => curr + acc * 60) * 1000
    );
  }

  /**
   * Returns time remaining until provided date
   * @param {Date} timeUntil
   */
  static getRemainingTime(timeUntil) {
    const seconds = Math.abs((timeUntil - new Date()) / 1000);
    const time = Utils.timeformat(seconds);
    return time;
  }

  
  /**
   * Formats the number given
   * @param {number} id
   */
  static formatWarningId(id) {
    const idString = id.toString();
    const paddedId = idString.padStart(3, '0'); // Pad with leading zeros up to 3 characters
    return paddedId;
}
};
