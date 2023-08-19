/**
 * Groups the properties of an object based on specified prefixes.
 * Each prefix represents a group, and properties with matching prefixes are added to their respective groups.
 *
 * @example
 * const data = {
 *   environment_name: 'development',
 *   database_username: 'username',
 *   database_password: 'password',
 *   log_level: 'info',
 *   log_enable_pretty: 'false',
 * }
 *
 * const prefixes = ['database', 'log'];
 *
 * const result = groupByPrefix(data, prefixes);
 * // result:
 * // {
 * //   environment_name: 'development',
 * //   database: {
 * //     database_username: 'username',
 * //     database_password: 'password',
 * //   },
 * //   log: {
 * //     log_level: 'info',
 * //     log_enable_pretty: 'false',
 * //   },
 * // }
 */
// @TODO: Write unit tests
export function groupByPrefix(
  data: Record<string, unknown>,
  prefixes: string[],
): Record<string, Record<string, unknown>> {
  const groups: Record<string, Record<string, unknown>> = {};

  for (const prefix of prefixes) {
    const group: Record<string, unknown> = {};
    groups[prefix] = group;

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(`${prefix}_`)) {
        group[key] = value;
      }
    }
  }

  return groups;
}
