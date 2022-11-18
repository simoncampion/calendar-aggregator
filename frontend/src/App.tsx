import React, { useEffect, useState } from 'react';
import './App.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';

const CALENDAR_URLS_LOCAL_STORAGE_KEY = 'calendar-urls';

export interface Event {
  text: string,
  date: Date,
}

async function getEvents(calendarUrls: string[]) {
  const response = await fetch('http://127.0.0.1:8000/api/events', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({'urls': calendarUrls}),
  });

  const json = await response.json();
  let events = new Map<string, Event[]>();
  for(const [url, eventsForUrl] of Object.entries<any>(json)) {
    events.set(
      url, 
      eventsForUrl.map((eventFromApi: any) => {
        return {
          text: eventFromApi.text,
          date: new Date(eventFromApi.date),
        };
      })
    )
  }
  return events;
}

interface EventWithUrl {
  event: Event,
  url: string,
}

function EventTable(props: {events: Map<string, Event[]>}) {
  let allEvents: Array<EventWithUrl> = Array.from(props.events.entries())
    .map(([url, events]) => events.map<EventWithUrl>((event) => {return {url: url, event: event};}))
    .flat()
    .flat();
  allEvents.sort((eventWithUrl1, eventWithUrl2) => eventWithUrl1.event.date < eventWithUrl2.event.date ? -1 : 1)
  return (
    <Table>
      <TableBody>
        {allEvents.map((eventWithUrl) => 
          <TableRow>
            <TableCell>
              {`${eventWithUrl.event.date.getMonth() + 1}/${eventWithUrl.event.date.getDate()}`}
            </TableCell>
            <TableCell>
              {eventWithUrl.event.text}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function Input(props: {selectedOptions: any[], setSelectedOptions: any}) {
  return (
    <Autocomplete
      options={[]}
      multiple 
      value={props.selectedOptions}
      open={false}
      freeSolo
      onChange={(_, newValue: string[]) => {
        console.log(newValue);
        props.setSelectedOptions(newValue);
      }}
      renderTags={(value: readonly string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label="calendar URLs"
          placeholder="paste URLs here"
        />
      )}
    />
  )
}

function App() {
  let [events, setEvents] = useState<Map<string, Event[]>>(new Map<string, Event[]>());
  const calendarUrlsInitialValue = JSON.parse(localStorage.getItem(CALENDAR_URLS_LOCAL_STORAGE_KEY) ?? "[]");
  let [calendarUrls, setCalendarUrls] = useState<string[]>(calendarUrlsInitialValue);
  useEffect(getAndShowEvents, [calendarUrls]);
  useEffect(() => localStorage.setItem('calendar-urls', JSON.stringify(calendarUrls)), [calendarUrls]);

  function getAndShowEvents() {
    getEvents(calendarUrls).then(events => setEvents(events));
  }

  return (
    <div className="App">
      <Input 
        setSelectedOptions={
          (newCalendarUrls: string[]) => {
            setCalendarUrls(newCalendarUrls); 
            getAndShowEvents();
          }
        }
        selectedOptions={calendarUrls}
      />
      <EventTable events={events} />
    </div>
  );
}

export default App;
export { EventTable };
