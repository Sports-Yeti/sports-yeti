<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sports Yeti Admin</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 24px; }
      h1, h2 { margin: 12px 0; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f5f5f5; text-align: left; }
    </style>
  </head>
  <body>
    <h1>Sports Yeti Admin</h1>

    <h2>Leagues</h2>
    <table>
      <thead><tr><th>ID</th><th>Name</th></tr></thead>
      <tbody>
        @foreach($leagues as $l)
          <tr><td>{{ $l->id }}</td><td>{{ $l->name }}</td></tr>
        @endforeach
      </tbody>
    </table>

    <h2>Facilities</h2>
    <table>
      <thead><tr><th>ID</th><th>League</th><th>Name</th></tr></thead>
      <tbody>
        @foreach($facilities as $f)
          <tr><td>{{ $f->id }}</td><td>{{ $f->league_id }}</td><td>{{ $f->name }}</td></tr>
        @endforeach
      </tbody>
    </table>

    <h2>Recent Bookings</h2>
    <table>
      <thead><tr><th>ID</th><th>League</th><th>Facility</th><th>User</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
      <tbody>
        @foreach($bookings as $b)
          <tr>
            <td>{{ $b->id }}</td>
            <td>{{ $b->league_id }}</td>
            <td>{{ $b->facility_id }}</td>
            <td>{{ $b->user_id }}</td>
            <td>{{ $b->start_at }}</td>
            <td>{{ $b->end_at }}</td>
            <td>{{ $b->status }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  </body>
  </html>

