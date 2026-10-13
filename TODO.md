# TODO

- [x] Implement 2D sim for MANETs and VANETs
- [ ] Actually use dt properly so then speeds can be realistically adjusted, this needs to be done before NS-3
  integration so then NS-3 can run for 1/dt seconds.
- [ ] Implement some more mobility models
    - [x] Random Waypoint Model
- [ ] Add NS-3 integration instead of these bad attenuation models
    - [ ] Export WorldSnapshot to NS-3 and allow it to maybe generate topology with it?
    - [ ] Remove or entirely refactor simulation/src/network/NetworkTopology.ts
    - [ ] Add an NS3Bridge in the TypeScript to communicate with a new ns3 folder
      - [ ] Run NS-3 in a separate process and communicate with it via IPC (e.g., sockets, shared memory, or something else)
    - [ ] Transfer some kind of message ID and message size to NS-3 to simulate that
      message being sent, + work out how this should work with MessageBus.