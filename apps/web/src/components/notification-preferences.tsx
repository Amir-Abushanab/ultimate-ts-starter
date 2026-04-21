import {
  categories,
  channels,
  notificationTypes,
} from "@ultimate-ts-starter/notifications/types";
import type {
  Category,
  Channel,
  NotificationType,
  Preferences,
} from "@ultimate-ts-starter/notifications/types";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Notification preferences manager.
 * Renders a grid of toggles grouped by category, one toggle per channel per notification type.
 *
 * TODO: Wire up to your API — load/save preferences via oRPC procedures.
 * For now uses local state to demonstrate the UI pattern.
 */

const categoryLabels: Record<Category, string> = {
  account: "Account",
  billing: "Billing",
  marketing: "Marketing",
  security: "Security",
  social: "Social & Teams",
  system: "System",
};

const channelLabels: Record<Channel, string> = {
  email: "Email",
  in_app: "In-App",
  push: "Push",
};

/** Check if all channels on a notification type are mandatory (hide from UI) */
const hasMandatoryEmail = (def: { mandatory?: Record<string, boolean> }) =>
  def.mandatory?.email === true;

const getDefaultPreferences = (): Preferences => {
  const prefs: Preferences = {};
  for (const [type, def] of Object.entries(notificationTypes)) {
    prefs[type] = { ...def.defaults };
  }
  return prefs;
};

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState<Preferences>(getDefaultPreferences);
  const toggle = (type: string, channel: Channel) => {
    setPrefs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type]?.[channel],
      },
    }));
  };

  const handleSave = () => {
    // TODO: call your API to persist preferences
    // await orpc.notifications.updatePreferences.mutate(prefs);
    toast.success("Notification preferences saved");
  };

  const grouped = new Map<
    Category,
    [string, (typeof notificationTypes)[NotificationType]][]
  >();
  for (const cat of categories) {
    grouped.set(cat, []);
  }
  for (const [type, def] of Object.entries(notificationTypes)) {
    grouped.get(def.category)?.push([type, def]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified for each type of event.
        </p>
      </div>

      {categories.map((cat) => {
        const types = grouped
          .get(cat)
          ?.filter(([_, def]) => !hasMandatoryEmail(def));
        if (types === undefined || types.length === 0) {
          return null;
        }

        return (
          <div key={cat} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {categoryLabels[cat]}
            </h4>
            <div className="space-y-2">
              {types.map(([type, def]) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="text-sm">{def.description}</div>
                  <div className="flex gap-3">
                    {channels.map((ch) => (
                      <label
                        key={ch}
                        className="flex items-center gap-1.5 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={prefs[type]?.[ch] ?? false}
                          onChange={() => {
                            toggle(type, ch);
                          }}
                        />
                        {channelLabels[ch]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Button onClick={handleSave}>Save preferences</Button>
    </div>
  );
};

export default NotificationPreferences;
