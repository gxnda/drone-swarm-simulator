# TODO

- [x] Implement 2D sim for MANETs and VANETs
- [x] Actually use dt properly so then speeds can be realistically adjusted, this needs to be done before NS-3
  integration so then NS-3 can run for 1/dt seconds.
- [ ] Implement some more mobility models
    - [x] Random Waypoint Model
    - [ ] Gauss-Markov Model
    - [ ] City Section Mobility Model

    - [ ] Pursue Mobility Model
    - [x] Boids
    - [ ] Boids with random waypoint centroid (similar to pursue model ig)
    - [ ] Column Mobility Model
- [ ] Add NS-3 integration instead of these bad attenuation models
    - [ ] Export WorldSnapshot to NS-3 and allow it to maybe generate topology and message bus with it?
        - NS-3 network needs to: be sent {dt, drone id positions (Topology), and messages to send (MessageBus)},
        - and should return every message that each drone can hear, and maybe dropped message count for metrics
    - [ ] Remove or entirely refactor simulation/src/network/NetworkTopology.ts
    - [ ] Add an NS3Bridge in the TypeScript to communicate with a new ns3 folder
        - [ ] Run NS-3 in a separate process and communicate with it via IPC (e.g., sockets, shared memory, or something
          else)
    - [ ] Transfer some kind of message ID and message size to NS-3 to simulate that
      message being sent, + work out how this should work with MessageBus.
    - [ ] NS-3 should be able to be sent (dt, drone snapshots, recently sent messages) and then return
      (delivered messages (+ metrics?), (messages that failed to send?))
        - Should it show message statuses in the vis? Like a sphere extending out on a broadcast, etc.
            - Probably not, don't think it helps my actual goal of understanding
        - Should it keep a topology as well that can be shown in the vis? will that help me at all in actually doing the
          MANET stuff
