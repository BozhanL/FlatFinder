# RealtimeDatabase

## Structure

<!-- https://firebase.google.com/docs/database/android/structure-data -->

```json
{
  "users": {
    "LM02eyCMMYbY6nDAWhhGw5dDpBv1": {
      "name": "test1",
      "groups": {
        "techpioneers": true
      }
    },
    "HfVofgsvv3XAkkX24l8h8fwdv9I3": {
      "name": "test",
      "groups": {
        "techpioneers": true
      }
    }
  },

  "groups": {
    "techpioneers": {
      "name": "Historical Tech Pioneers",
      "members": {
        "LM02eyCMMYbY6nDAWhhGw5dDpBv1": true,
        "HfVofgsvv3XAkkX24l8h8fwdv9I3": true
      }
    }
  },

  "chats": {
    "techpioneers": {
      "title": "Historical Tech Pioneers",
      "lastMessage": "The relay seems to be malfunctioning.",
      "timestamp": 1459361875337
    }
  },

  "messages": {
    "techpioneers": {
      "m1": {
        "uid": "LM02eyCMMYbY6nDAWhhGw5dDpBv1",
        "message": "The relay seems to be malfunctioning.",
        "timestamp": 1459361875337
      }
    }
  }
}
```
