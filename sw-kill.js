// Unregister any stale service workers from old Coconut app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('[Orchestra] Unregistered stale service worker');
    }
  });
}
