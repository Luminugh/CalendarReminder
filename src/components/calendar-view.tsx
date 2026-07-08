"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import esLocale from "@fullcalendar/core/locales/es"
import type { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core"
import { createClient } from "@/lib/supabase/client"
import type { CalendarEvent } from "@/lib/types"
import EventForm from "./event-form"

export default function CalendarView() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [defaultStartDate, setDefaultStartDate] = useState<string>("")
  const [defaultEndDate, setDefaultEndDate] = useState<string>("")

  function loadEvents() {
    const supabase = createClient()

    supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar eventos:", error)
          return
        }

        setEvents(
          (data as CalendarEvent[]).map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start_date,
            end: event.end_date,
            allDay: event.all_day,
            color: event.color,
            extendedProps: {
              description: event.description,
              category: event.category,
              priority: event.priority,
            },
          }))
        )
      })
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function handleDateSelect(selectInfo: DateSelectArg) {
    let startStr = selectInfo.startStr
    let endStr = selectInfo.endStr

    if (selectInfo.allDay) {
      if (!startStr.includes("T")) startStr += "T00:00"
      if (!endStr.includes("T")) endStr += "T00:00"
    }

    setSelectedEvent(null)
    setDefaultStartDate(startStr)
    setDefaultEndDate(endStr)
    setSheetOpen(true)
  }

  function handleEventClick(clickInfo: EventClickArg) {
    const supabase = createClient()

    supabase
      .from("events")
      .select("*")
      .eq("id", clickInfo.event.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setSelectedEvent(data as CalendarEvent)
          setDefaultStartDate("")
          setDefaultEndDate("")
          setSheetOpen(true)
        }
      })
  }

  return (
    <div className="h-full animate-fade-in">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={esLocale}
        headerToolbar={{
          left: "prevYear,prev,next,nextYear today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        firstDay={1}
        unselectAuto={false}
      />
      <EventForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEventSaved={loadEvents}
        event={selectedEvent}
        defaultStartDate={defaultStartDate}
        defaultEndDate={defaultEndDate}
      />
    </div>
  )
}
