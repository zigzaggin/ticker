<template>
  <v-app>
    <v-app-bar
        app
        color="deep-purple"
        dark
        dense
    >
      <v-toolbar-title>Ticker</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
          color="cyan"
          @click="addSession"
      >
        <v-icon left>mdi-plus</v-icon>
        Add Session
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-expansion-panels
            v-model="open"
            multiple
            focusable
        >
          <v-expansion-panel
              v-for="(session, i) in sessions"
              :key="session.guid"
              v-model="open"
          >
            <v-expansion-panel-header>
              <template v-slot:default="{ }">
                <v-row no-gutters>
                  <v-col cols="2">
                    <div>Session {{ sessions.length - i }}</div>
                    <div class="pt-2">{{ session.date }}</div>
                  </v-col>
                  <v-col>
                    <v-row no-gutters>
                      <v-col
                          v-for="(student, t) in session.students"
                          :key="t"
                      >
                        <div
                            class="student"
                        >
                          <span class="name">{{ name(student) }}</span>
                          <v-row class="pt-2">
                            <v-col>
                              <v-row>
                                <v-col>
                                  <span class="percentage green--text">
                                    {{ d(toPercent("+", student)) }}% | {{ d(toPercent("+/", student)) }}%
                                  </span>
                                </v-col>
                                <v-col justify="end">
                                  <span>
                                    {{ student.pluses }} + {{ student.cues }} / {{ total(student) }}
                                  </span>
                                </v-col>
                              </v-row>
                            </v-col>

                            <v-col>
                              <v-row>
                                <v-col>
                                  <span class="percentage red--text">{{ d(toPercent("-", student)) }}%</span>
                                </v-col>
                                <v-col justify="end">
                                  <span>
                                    {{ student.minuses }} / {{ total(student) }}
                                  </span>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="pt-5">
              <v-row>
                <v-col
                    v-for="(student, t) in session.students"
                    :key="t"
                >
                  <v-card>
                    <v-card-text>
                      <v-text-field
                          v-model="student.name"
                          label="Student"
                      />
                      <v-row>
                        <v-col>
                          <v-text-field
                              v-model.number="student.pluses"
                              label="Pluses"
                          >
                            <template v-slot:append>
                              <v-icon
                                  color="green"
                                  @click="student.pluses++"
                              >
                                mdi-plus
                              </v-icon>
                            </template>
                          </v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field
                              v-model.number="student.cues"
                              label="Cues"
                          >
                            <template v-slot:append>
                              <v-icon
                                  color="green"
                                  @click="student.cues++"
                              >
                                mdi-plus
                              </v-icon>
                            </template>
                          </v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field
                              v-model.number="student.minuses"
                              label="Minuses"
                          >

                            <template v-slot:append>
                              <v-icon
                                  color="green"
                                  @click="student.minuses++"
                              >
                                mdi-plus
                              </v-icon>
                            </template>
                          </v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-divider class="my-5"/>
              <v-btn
                  color="primary"
                  class="mr-5"
                  @click="addStudent(session)"
              >
                Add Student
              </v-btn>
              <v-btn
                  color="error"
                  @click="removeSession(session.guid)"
              >
                Remove Session
              </v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <template v-if="sessions.length > 0">
          <v-divider class="my-5"/>
          <v-btn
              color="error"
              @click="sessions = []"
          >
            Clear Sessions
          </v-btn>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import format from "date-fns/format";
import db from "./db/db";

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export default {
  name: 'App',
  components: {},
  data() {
    return {
      open: [0],
      sessions: []
    }
  },
  created() {
    this.sessions = db.load();
  },
  watch: {
    sessions: {
      handler() {
        db.persist(this.sessions || []);
      },
      deep: true
    }
  },
  methods: {
    addSession() {
      let id = uuidv4();
      this.sessions.unshift({
        guid: id,
        date: format(new Date(), "M/d/yy h:mm:ss a"),
        students: [
          {
            name: 1,
            pluses: 0,
            minuses: 0,
            cues: 0
          },
          {
            name: 2,
            pluses: 0,
            minuses: 0,
            cues: 0
          }
        ]
      });
      this.open.push(this.sessions.length)
    },
    addStudent(session) {
      session.students.push({
        name: session.students.length + 1,
        pluses: 0,
        minuses: 0,
        cues: 0
      })
    },
    removeSession(guid) {
      this.sessions = this.sessions.filter(f => f.guid !== guid);
    },
    toPercent(type, student) {
      const total = this.total(student);
      if (total === 0)
        return 0;

      if (type === "+") {
        const pluses = (student.pluses || 0);
        return (pluses / total) * 100
      } else if (type === "+/") {
        const pluses = (student.pluses || 0) + (student.cues || 0);
        return (pluses / total) * 100
      } else {
        return (student.minuses || 0) / total * 100;
      }
    },
    total(student) {
      return (student.pluses || 0) + (student.minuses || 0) + (student.cues || 0);
    },
    name(student) {
      if ((student.name + "").length <= 1)
        return `Student ${student.name}`;

      return student.name;
    },
    d(f) {
      return f.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    }
  }
}
</script>

<style lang="scss">
</style>
