// Folder ID which is folder where you wanna copy minutes in
const FOLDER_ID = "Folder ID which is folder where you wanna copy minutes in";
function copy(): GoogleAppsScript.Drive.File {
  // Direct the folder which original file exists
  const folder: GoogleAppsScript.Drive.Folder = DriveApp.getFolderById(
    FOLDER_ID
  );

  // File name is descension by numeric so, front of iteration is latest file.
  const files: GoogleAppsScript.Drive.FileIterator = folder.getFiles();
  const file: GoogleAppsScript.Drive.File = files.next();

  // front of file name yyyyMMdd format
  const date: string = Utilities.formatDate(
    new Date(),
    "Asia/Tokyo",
    "yyyyMMdd"
  );
  // file name with date yyyyMMdd format
  const name: string = `${date}議事録`;

  // execute file copy and return file object
  return file.makeCopy(name, folder);
}
//　define slack web hook url
const SLACK_WEBHOOK_URL: string = PropertiesService.getScriptProperties().getProperty(
  "SLACK_WEBHOOK_URL"
);
// Post minutes URL to Slack
function send(url: string): void {
  Logger.log(SLACK_WEBHOOK_URL);
  const text: string = `今日の議事録はこちらに${url}`;

  const data = {
    username: "minutes auto templater",
    icon_emoji: ":bookmark_tabs:",
    text,
  };

  let params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),
  };

  var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, params);
  Logger.log("response code = " + response.getResponseCode()); //400が返るはず
  Logger.log("response body = " + response.getContentText()); //エラーの原因が返るはず
}

function isHoliday(): boolean {
  const today: Date = new Date();
  const calendars: GoogleAppsScript.Calendar.Calendar[] = CalendarApp.getCalendarsByName(
    "日本の祝日"
  );
  const count: number = calendars[0].getEventsForDay(today).length;
  return count > 0;
}

// entry point
function main(): void {
  // if today is holiday, don't send URL to slack
  if (isHoliday()) {
    return;
  }
  // create copy of minutes
  const file: GoogleAppsScript.Drive.File = copy();
  // get url of minutes
  const url: string = file.getUrl();
  // post minutes url to slack
  send(url);
}
