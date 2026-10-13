# TODO

- [ ] Implement 2D sim for MANETs and VANETs
- [ ] Actually use dt properly so then speeds can be realistically adjusted
- [ ] Implement some more mobility models
- [ ] Add NS-3 integration instead of these bad attenuation models
    - [ ] Export WorldSnapshot to NS-3 and allow it to maybe generate topology with it?
    - [ ] Remove or entirely refactor simulation/src/network/NetworkTopology.ts
    - [ ] Implement MessageBus in NS-3 OR transfer some kind of message ID and message size to NS-3 to simulate that
      message being sent