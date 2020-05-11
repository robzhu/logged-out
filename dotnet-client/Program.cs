using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Websocket.Client;

namespace dotnet_client
{
  static class Program
  {
    const string LoginEndpoint = "http://localhost:9000/login";
    const string UserID = "1234";
    static Uri WebSocketEndpoint = new Uri("ws://localhost:9001");

    static async Task Main(string[] args)
    {
      HttpClient client = new HttpClient();

      client.DefaultRequestHeaders.Add("user", UserID);
      dynamic response = JsonConvert.DeserializeObject(await client.GetStringAsync(LoginEndpoint));
      string sessionId = response.sessionId;
      Console.WriteLine("Obtained session ID: " + sessionId);

      using (var socket = new WebsocketClient(WebSocketEndpoint))
      {
        await socket.Start();

        socket.MessageReceived.Subscribe(msg =>
        {
          dynamic payload = JsonConvert.DeserializeObject(msg.Text);
          if (payload["event"] == "sessionInvalidated")
          {
            Console.WriteLine("You have logged in elsewhere. Exiting.");
            Environment.Exit(0);
          }
        });

        socket.Send(JsonConvert.SerializeObject(new
        {
          action = "subscribeToSessionInvalidation",
          args = new
          {
            sessionId = sessionId
          }
        }));

        Console.WriteLine("Press ENTER to exit.");
        Console.ReadLine();
      }
    }
  }
}
