import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import eventsData from "../data/events.json";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", time: "", duration: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null); // ✅ new

  useEffect(() => {
  const checkReminders = () => {
    const now = dayjs();
    const upcoming = events.filter((event) => {
      const eventTime = dayjs(`${event.date} ${event.time}`, "YYYY-MM-DD hh:mm A");
      return eventTime.diff(now, "minute") >= 0 && eventTime.diff(now, "minute") <= 10;
    });

    upcoming.forEach((event) => {
      alert(`🔔 Reminder: ${event.title} starts at ${event.time}`);
    });
  };

  const interval = setInterval(checkReminders, 60000); // every 1 minute
  return () => clearInterval(interval);
}, [events]);


  const daysInMonth = currentDate.daysInMonth();
  const startDay = currentDate.startOf("month").day();

  const changeMonth = (amount) => {
    setCurrentDate(currentDate.add(amount, "month"));
    setSelectedEventIndex(null); // optional: reset selection on month change
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...events];
      updated[editIndex] = form;
      setEvents(updated);
      setEditIndex(null);
    } else {
      setEvents([...events, form]);
    }
    setForm({ title: "", date: "", time: "", duration: "" });
    setSelectedEventIndex(null); // reset after submit
  };

  const handleEdit = (index) => {
    setForm(events[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
    if (editIndex === index) {
      setForm({ title: "", date: "", time: "", duration: "" });
      setEditIndex(null);
    }
    setSelectedEventIndex(null);
  };

  const getEventsForDate = (dateStr) => {
    return events.filter((e) => e.date === dateStr);
  };

  const generateCalendar = () => {
    const rows = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const cells = [];

      for (let j = 0; j < 7; j++) {
        const dateStr = currentDate.date(day).format("YYYY-MM-DD");

        if (i === 0 && j < startDay) {
          cells.push(<td key={j}></td>);
        } else if (day <= daysInMonth) {
          const isToday = dayjs().isSame(currentDate.date(day), "day");

          cells.push(
            <td key={j} className={`p-2 border h-28 align-top ${isToday ? "bg-blue-100" : ""}`}>
              <div className="font-bold">{day++}</div>
              <div className="space-y-1 text-xs">
                {getEventsForDate(dateStr).map((event, idx) => {
                  const globalIndex = events.findIndex(e => e === event);
                  const isSelected = selectedEventIndex === globalIndex;

                  return (
                    <div
                      key={idx}
                      className="bg-blue-200 p-1 rounded text-xs cursor-pointer"
                      onClick={() => setSelectedEventIndex(isSelected ? null : globalIndex)}
                    >
                      <span className="font-semibold">{event.title}</span>

                      {isSelected && (
                        <div className="mt-1 space-y-1">
                          <div>🕒 {event.time}</div>
                          <div>⏱ {event.duration}</div>
                          <div className="space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(globalIndex);
                              }}
                              className="text-green-600"
                            >✏️</button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(globalIndex);
                              }}
                              className="text-red-600"
                            >🗑</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </td>
          );
        }
      }

      rows.push(<tr key={i}>{cells}</tr>);
    }

    return rows;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => changeMonth(-1)} className="btn">← Prev</button>
        <h2 className="text-xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={() => changeMonth(1)} className="btn">Next →</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleInputChange} className="input" required />
        <input type="date" name="date" value={form.date} onChange={handleInputChange} className="input" required />
        <input type="time" name="time" value={form.time} onChange={handleInputChange} className="input" required />
        <input type="text" name="duration" placeholder="Duration" value={form.duration} onChange={handleInputChange} className="input" required />
        <button type="submit" className="btn col-span-2 md:col-span-4">
          {editIndex !== null ? "Update Event" : "Add Event"}
        </button>
      </form>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <th key={d} className="border p-2 bg-gray-200">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>{generateCalendar()}</tbody>
      </table>
    </div>
  );
};

export default Calendar;
