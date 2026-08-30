# POS browser launch integration

CellPoint Pro POS is a Windows desktop application built with .NET. The first
integration should open the Marketing Center in the user's default Windows
browser; it should not embed the web application inside the POS.

## Development launch

During the current Demo Mode phase, the POS can open:

```text
https://<marketing-center-host>/launch?storeId=demo
```

The Marketing Center validates the `storeId` locally, identifies the active
workspace as the Riverbend Wireless demo store, and opens the existing demo
dashboard. The URL value is routing context only. It is not authentication,
authorization, or proof that the caller is an approved POS installation.

Example C# launch code:

```csharp
using System.Diagnostics;

var launchUrl = "https://<marketing-center-host>/launch?storeId=demo";
Process.Start(new ProcessStartInfo(launchUrl) { UseShellExecute = true });
```

The standalone workspace remains available at the root URL and should continue
to be used for normal sign-in once authentication is enabled.

## Production security requirements

Do not put passwords, API keys, social tokens, permanent credentials, or other
secrets in the URL. Production launch must replace the demo query parameter
with a short-lived, signed, one-time launch token or an equivalent SSO/OIDC
architecture. The token should be delivered over HTTPS, validated server-side,
bound to the intended store and user, expire quickly, and be rejected after
reuse.

The future launch request contract is `POST /api/pos/launch` and includes:

- `storeId`
- `userId`
- `userName`
- `storeName`
- `storePhone`
- `storeAddress`
- `storeWebsite`
- `storeLogo`

The API currently validates that shape and returns `501 Not Implemented` on
purpose. It does not create a session or perform SSO yet. When production
authentication is implemented, the secure token should be carried in a
standard authorization mechanism rather than added to a browser URL.