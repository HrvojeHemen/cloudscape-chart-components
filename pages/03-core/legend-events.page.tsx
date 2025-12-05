// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import Highcharts from "highcharts";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";

import CoreChart from "../../lib/components/internal-do-not-use/core-chart";
import { useChartSettings } from "../common/page-settings";
import { Page } from "../common/templates";

// Simple data with 3 data points
const lineSeries: Highcharts.SeriesOptionsType[] = [
  {
    id: "series-a",
    name: "Series A",
    type: "line",
    data: [10, 20, 15],
  },
  {
    id: "series-b",
    name: "Series B",
    type: "line",
    data: [15, 25, 30],
  },
  {
    id: "series-c",
    name: "Series C",
    type: "line",
    data: [5, 15, 25],
  },
];

interface EventLog {
  id: number;
  timestamp: string;
  type: "highlight" | "clear";
  itemName?: string;
  isApiCall?: boolean;
}

export default function LegendEventsDemo() {
  const { chartProps } = useChartSettings();
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const [eventCounter, setEventCounter] = useState(0);

  const addEvent = (type: "highlight" | "clear", itemName?: string, isApiCall?: boolean) => {
    const newEvent: EventLog = {
      id: eventCounter,
      timestamp: new Date().toLocaleTimeString(),
      type,
      itemName,
      isApiCall,
    };

    setEventLog((prev) => [newEvent, ...prev.slice(0, 4)]); // Keep only last 5 events
    setEventCounter((prev) => prev + 1);
  };

  const handleLegendItemHighlight = (event: { detail: { item: { name: string } } }) => {
    const itemName = event.detail.item.name;
    setHighlightedItem(itemName);
    addEvent("highlight", itemName, false);
  };

  const handleClearHighlight = (event: { detail: { isApiCall?: boolean } }) => {
    setHighlightedItem(null);
    addEvent("clear", undefined, event.detail.isApiCall);
  };

  const clearEventLog = () => {
    setEventLog([]);
    setEventCounter(0);
  };

  return (
    <Page title="Legend Events Demo" subtitle="Demonstrates onLegendItemHighlight and onLegendItemHighlightExit events">
      <SpaceBetween direction="vertical" size="m">
        {/* Current State */}
        <Alert
          type={highlightedItem ? "info" : "success"}
          header={highlightedItem ? `Highlighted: ${highlightedItem}` : "No item highlighted"}
        >
          {highlightedItem
            ? "Move away or press Escape to clear highlight."
            : "Hover over or focus on any legend item to trigger highlight events."}
        </Alert>

        {/* Simple Line Chart */}
        <CoreChart
          {...chartProps.cartesian}
          highcharts={Highcharts}
          chartHeight={300}
          ariaLabel="Line chart with legend events"
          onLegendItemHighlight={handleLegendItemHighlight}
          onLegendItemHighlightExit={() => handleClearHighlight({ detail: { isApiCall: false } })}
          options={{
            series: lineSeries,
            xAxis: [{ categories: ["Jan", "Feb", "Mar"] }],
            yAxis: [{ title: { text: "Values" } }],
            title: { text: "Simple Chart" },
          }}
        />

        {/* Event Log */}
        <Box>
          <SpaceBetween direction="vertical" size="s">
            <SpaceBetween direction="horizontal" size="s" alignItems="center">
              <Box variant="h3">Event Log</Box>
              <button onClick={clearEventLog} style={{ padding: "4px 8px", fontSize: "12px" }}>
                Clear
              </button>
            </SpaceBetween>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e1e4e8",
                borderRadius: "4px",
                padding: "12px",
                minHeight: "100px",
              }}
            >
              {eventLog.length === 0 ? (
                <div style={{ color: "#6a737d", fontStyle: "italic" }}>
                  No events yet. Interact with the legend items above.
                </div>
              ) : (
                eventLog.map((event) => (
                  <div key={event.id} style={{ marginBottom: "4px" }}>
                    <span style={{ color: "#0366d6" }}>[{event.timestamp}]</span>{" "}
                    <span style={{ color: event.type === "highlight" ? "#28a745" : "#dc3545" }}>
                      {event.type.toUpperCase()}
                    </span>{" "}
                    {event.itemName && (
                      <>
                        item: <span style={{ fontWeight: "bold" }}>{event.itemName}</span>{" "}
                      </>
                    )}
                    {event.type === "clear" && (
                      <span style={{ color: "#6a737d" }}>(isApiCall: {event.isApiCall ? "true" : "false"})</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </Page>
  );
}
